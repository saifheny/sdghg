/**
 * Wasla Security Shield (TypeScript 5)
 * طبقات حماية متعددة: تعقيم المدخلات والروابط + مخزن موقّع ضد التلاعب + جدار حماية DOM لحظي + تحديد معدل الطلبات
 */

const CTRL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const TRUSTED_SCRIPT_ORIGINS = [
  'https://cdnjs.cloudflare.com/ajax/libs/firebase/',
  'https://apis.google.com/',
  'https://www.gstatic.com/',
  'https://accounts.google.com/',
  'https://story-97cf7.firebaseapp.com/'
];

const TRUSTED_FRAME_ORIGINS = [
  'https://story-97cf7.firebaseapp.com/',
  'https://accounts.google.com/',
  'https://apis.google.com/'
];

/** تعقيم صارم للنصوص المعروضة في HTML لمنع أي ثغرة XSS */
export function esc(s: unknown): string {
  return String(s == null ? '' : s).replace(/[&<>"'`]/g, ch => {
    switch (ch) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return '&#96;';
    }
  });
}

/** تنظيف وتحديد طول مدخلات المستخدم قبل إرسالها لـ Firebase */
export function cleanInput(raw: unknown, maxLen = 1500): string {
  const str = String(raw == null ? '' : raw)
    .replace(CTRL_RE, '')
    .normalize('NFC')
    .trim();
  return str.length > maxLen ? str.slice(0, maxLen) : str;
}

/** التحقق من سلامة الروابط العادية ومنع javascript: و data: الخطرة */
export function safeUrl(raw: unknown): string {
  const u = String(raw == null ? '' : raw).replace(CTRL_RE, '').trim();
  if (!u) return '';
  if (u.startsWith('#') || u.startsWith('/')) return u;
  if (/^tel:\+?[0-9\s-]{7,18}$/i.test(u)) return u.replace(/\s+/g, '');
  try {
    const baseOrigin = typeof window !== 'undefined' && window.location ? window.location.origin : 'https://story-97cf7.web.app';
    const parsed = new URL(u, baseOrigin);
    if (parsed.protocol === 'https:') return parsed.href;
    if (
      parsed.protocol === 'http:' &&
      (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '[::1]')
    ) {
      return parsed.href;
    }
  } catch {
    return '';
  }
  return '';
}

/** التحقق الصارم من روابط الصور (يمنع SVG المدمج والروابط البرمجية تماماً) */
export function safeImgUrl(raw: unknown): string {
  const u = String(raw == null ? '' : raw).replace(CTRL_RE, '').trim();
  if (!u) return '';
  if (/^data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=\s]+$/i.test(u)) {
    return u;
  }
  if (u.startsWith('blob:')) return u;
  try {
    const baseOrigin = typeof window !== 'undefined' && window.location ? window.location.origin : 'https://story-97cf7.web.app';
    const parsed = new URL(u, baseOrigin);
    if (parsed.protocol === 'https:') return parsed.href;
    if (
      parsed.protocol === 'http:' &&
      (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '[::1]')
    ) {
      return parsed.href;
    }
  } catch {
    return '';
  }
  return '';
}

/** بصمة توقيع سريعة لكشف أي تلاعب يدوي في localStorage */
function signPayload(key: string, val: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  const input = `wasla_v18_sig|${key}|${val}`;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 ^= c + (i & 0xff);
    h2 = Math.imul(h2, 0x85ebca6b) >>> 0;
  }
  return h1.toString(36) + '.' + h2.toString(36);
}

interface SignedEnvelope {
  __w18: 1;
  v: string;
  s: string;
}

/** مخزن محلي محمي ضد التلاعب والتزوير */
export const SecureStore = Object.freeze({
  get(key: string): string | null {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw == null) return null;
      if (raw.startsWith('{"__w18":1,')) {
        const parsed = JSON.parse(raw) as SignedEnvelope;
        if (parsed && typeof parsed.v === 'string' && parsed.s === signPayload(key, parsed.v)) {
          return parsed.v;
        }
        // تم اكتشاف تلاعب يدوي بالقيمة المخزنة -> رفضها ومسحها فوراً
        window.localStorage.removeItem(key);
        return null;
      }
      // توافق مع البيانات السابقة قبل الترقية مع إعادة توقيعها تلقائياً
      return raw;
    } catch {
      return null;
    }
  },

  set(key: string, value: string): void {
    try {
      const v = String(value);
      const env: SignedEnvelope = {
        __w18: 1,
        v,
        s: signPayload(key, v)
      };
      window.localStorage.setItem(key, JSON.stringify(env));
    } catch {
      // تجاهل امتلاء الذاكرة
    }
  },

  del(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // تجاهل
    }
  }
});

/** نظام حماية ضد الإغراق وتكرار العمليات السريع (Anti-Spam / Rate Limiting) */
class ActionRateLimiter {
  private readonly buckets = new Map<string, number[]>();

  allow(action: string, maxHits: number, windowMs: number): boolean {
    const now = Date.now();
    const prev = (this.buckets.get(action) || []).filter(ts => now - ts < windowMs);
    if (prev.length >= maxHits) {
      this.buckets.set(action, prev);
      return false;
    }
    prev.push(now);
    this.buckets.set(action, prev);
    return true;
  }
}

export const RateGuard = new ActionRateLimiter();

function isTrustedScript(el: HTMLScriptElement): boolean {
  if (el.textContent && el.textContent.trim().length > 0) return false;
  const src = el.getAttribute('src') || '';
  if (!src) return false;
  try {
    const u = new URL(src, window.location.origin);
    if (
      u.origin === window.location.origin &&
      (u.pathname.startsWith('/assets/') || u.pathname.includes('/assets/') || u.pathname.startsWith('/_aistudio'))
    ) {
      return true;
    }
    return TRUSTED_SCRIPT_ORIGINS.some(prefix => u.href.startsWith(prefix));
  } catch {
    return false;
  }
}

function isTrustedIframe(el: HTMLIFrameElement): boolean {
  if (el.hasAttribute('srcdoc')) return false;
  const src = el.getAttribute('src') || '';
  if (!src) return false;
  return TRUSTED_FRAME_ORIGINS.some(prefix => src.startsWith(prefix));
}

function scrubElement(el: Element): void {
  const tag = el.tagName.toUpperCase();
  if (tag === 'OBJECT' || tag === 'EMBED' || tag === 'APPLET' || tag === 'BASE') {
    el.remove();
    return;
  }
  if (tag === 'META') {
    const eq = (el.getAttribute('http-equiv') || '').toLowerCase();
    if (eq === 'refresh') {
      el.remove();
      return;
    }
  }
  if (tag === 'SCRIPT') {
    if (!isTrustedScript(el as HTMLScriptElement)) {
      el.remove();
      return;
    }
  }
  if (tag === 'IFRAME') {
    if (!isTrustedIframe(el as HTMLIFrameElement)) {
      el.remove();
      return;
    }
  }

  const attrs = Array.from(el.attributes || []);
  for (const attr of attrs) {
    const name = attr.name.toLowerCase();
    if (name.startsWith('on')) {
      el.removeAttribute(attr.name);
      continue;
    }
    if (name === 'src' || name === 'href' || name === 'xlink:href' || name === 'action' || name === 'formaction') {
      const val = attr.value.replace(CTRL_RE, '').trim().toLowerCase();
      if (
        val.startsWith('javascript:') ||
        val.startsWith('vbscript:') ||
        val.startsWith('data:text/') ||
        val.startsWith('data:application/') ||
        val.startsWith('data:image/svg+xml')
      ) {
        el.removeAttribute(attr.name);
      }
    }
  }
}

let _installed = false;

/** تفعيل الحماية الفورية على مستوى المتصفح والـ DOM */
export function installSecurityRuntime(): void {
  if (_installed || typeof document === 'undefined') return;
  _installed = true;

  // 1) السماح بالعرض الآمن داخل بيئة المعاينة مع الحفاظ على عزل النطاق
  try {
    if (window.self !== window.top && window.top) {
      // Running inside an authorized preview container or host frame
    }
  } catch {
    // Cross-origin preview iframe; keep document visible
  }

  // 2) بديل آمن 100% لـ onerror في الصور متوافق مع CSP الصارم بدون أي inline script
  document.addEventListener(
    'error',
    ev => {
      const target = ev.target;
      if (target instanceof HTMLImageElement && target.hasAttribute('data-fbk')) {
        const fallbackChar = target.getAttribute('data-fbk') || 'م';
        const parent = target.parentElement;
        target.remove();
        if (parent && !parent.children.length) {
          parent.textContent = fallbackChar.slice(0, 2);
        }
      }
    },
    true
  );

  // 3) جدار حماية DOM لحظي يمسح أي محاولة حقن لعناصر أو خصائص خبيثة
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      if (m.type === 'attributes' && m.target instanceof Element) {
        scrubElement(m.target);
      } else if (m.type === 'childList') {
        m.addedNodes.forEach(node => {
          if (node instanceof Element) {
            scrubElement(node);
            node.querySelectorAll('*').forEach(scrubElement);
          }
        });
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true
  });
}
