export interface VisualNotifMeta {
  kind: 'interaction' | 'publish' | 'system' | 'alert' | 'offer';
  icon: string;
  color: string;
  badge: string;
  cleanTitle: string;
  cleanSub: string;
}

/**
 * تنظيف رسائل النظام من أي أكواد تقنية باللغة الإنجليزية (مثل auth/... أو permission-denied)
 * وتحويلها إلى إشعار مرئي أنيق داخل قسم الإشعارات بدلاً من التوست السفلي المزعج
 */
export function sanitizeSystemMessage(raw: string): string {
  const s = String(raw || '').trim();
  if (!s) return '';
  return s
    .replace(/\(\s*(?:auth|firestore|storage|functions)\/[a-z0-9_-]+\s*\)/gi, '')
    .replace(/\(\s*(?:permission-denied|unavailable|unauthenticated|internal|not-found|cancelled|unknown|خطأ)\s*\)/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function classifyNotifMessage(raw: string): VisualNotifMeta {
  const cleanTitle = sanitizeSystemMessage(raw);
  const lower = cleanTitle.toLowerCase();

  if (
    cleanTitle.includes('تفاعل') ||
    cleanTitle.includes('أشخاص') ||
    cleanTitle.includes('عروض') ||
    cleanTitle.includes('عرض سعر')
  ) {
    return {
      kind: 'interaction',
      icon: 'sparkle',
      color: 'var(--lav)',
      badge: 'تفاعل على منشورك',
      cleanTitle,
      cleanSub: 'تفاعل جديد من مقدمي الخدمة والأعضاء على وصلة'
    };
  }

  if (
    cleanTitle.includes('اتنشر') ||
    cleanTitle.includes('تم نشر') ||
    cleanTitle.includes('اتعدّل') ||
    cleanTitle.includes('اتضافت') ||
    cleanTitle.includes('ألف مبروك') ||
    cleanTitle.includes('نوّرت وصلة') ||
    cleanTitle.includes('مبروك الاتفاق') ||
    cleanTitle.includes('تم ومكتمل')
  ) {
    return {
      kind: 'publish',
      icon: 'rocket',
      color: 'var(--mint)',
      badge: 'تم بنجاح ✓',
      cleanTitle,
      cleanSub: 'تحديث فوري لنشاطك ومعاملاتك على المنصة'
    };
  }

  if (
    cleanTitle.includes('معرفناش') ||
    cleanTitle.includes('مشكلة') ||
    cleanTitle.includes('فشل') ||
    cleanTitle.includes('قفلت نافذة') ||
    cleanTitle.includes('اتلغى') ||
    cleanTitle.includes('اتمسح')
  ) {
    return {
      kind: 'alert',
      icon: 'warn',
      color: 'var(--peach)',
      badge: 'إشعار من النظام',
      cleanTitle,
      cleanSub: 'تنبيه تلقائي من نظام وصلة بخصوص آخر عملية'
    };
  }

  return {
    kind: 'system',
    icon: 'bellring',
    color: 'var(--sun)',
    badge: 'نظام وصلة',
    cleanTitle,
    cleanSub: 'إشعار من مركز تنبيهات وصلة'
  };
}

export function formatInteractionSummary(count: number, requestTitle: string): string {
  const n = Math.max(1, Math.round(Number(count) || 1));
  const title = String(requestTitle || 'طلبك المنشور').trim();
  const peopleLabel =
    n === 1
      ? 'شخص واحد'
      : n === 2
      ? 'شخصين'
      : n >= 3 && n <= 10
      ? `${n} أشخاص`
      : `${n} شخص`;
  return `تم التفاعل من قبل ${peopleLabel} على منشورك «${title}»`;
}
