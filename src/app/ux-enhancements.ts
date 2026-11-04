/**
 * ميزات تطوير تجربة المستخدم والواجهة لمنصة وصلة (UI/UX Enhancements Core Logic)
 */

export interface CarrierInfo {
  cleanDigits: string;
  formatted: string;
  carrier: string;
  code: 'vodafone' | 'etisalat' | 'orange' | 'we' | '';
  color: string;
  isComplete: boolean;
  isValid: boolean;
}

/** تحويل الأرقام العربية/الهندية وتنسيق رقم الموبايل المصري مع كشف الشبكة لحظياً (#10) */
export function detectEgyptianCarrier(rawPhone: unknown): CarrierInfo {
  const raw = String(rawPhone == null ? '' : rawPhone)
    .replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[^\d+]/g, '');

  let digits = raw;
  if (digits.startsWith('+20')) digits = '0' + digits.slice(3);
  else if (digits.startsWith('20') && digits.length >= 12) digits = '0' + digits.slice(2);
  else if (digits.startsWith('1') && digits.length <= 10) digits = '0' + digits;

  digits = digits.replace(/\D/g, '').slice(0, 11);

  const p1 = digits.slice(0, 3);
  const p2 = digits.slice(3, 7);
  const p3 = digits.slice(7, 11);
  const formatted = [p1, p2, p3].filter(Boolean).join(' ');

  let carrier = '';
  let code: CarrierInfo['code'] = '';
  let color = 'var(--bg)';

  if (digits.startsWith('010')) {
    carrier = 'فودافون';
    code = 'vodafone';
    color = '#FFE1DE';
  } else if (digits.startsWith('011')) {
    carrier = 'اتصالات e&';
    code = 'etisalat';
    color = '#E2FAF4';
  } else if (digits.startsWith('012')) {
    carrier = 'أورانج';
    code = 'orange';
    color = '#FFE8D4';
  } else if (digits.startsWith('015')) {
    carrier = 'وي WE';
    code = 'we';
    color = '#EAE5FF';
  }

  const isValid = /^01[0125]\d{8}$/.test(digits);
  return {
    cleanDigits: digits,
    formatted,
    carrier,
    code,
    color,
    isComplete: digits.length === 11,
    isValid
  };
}

/** حساب المسافة بالكيلومتر والوقت التقريبي بالدقائق (#13) */
export function formatDistanceAndEta(km: number): { short: string; detailed: string; mins: number } {
  if (!Number.isFinite(km) || km >= 9000 || km < 0) {
    return { short: '', detailed: '', mins: 0 };
  }
  const mins = Math.max(2, Math.min(180, Math.round(km * 2.4 + 2)));
  const minLabel = mins <= 2 ? 'دقيقتين' : mins <= 10 ? `${mins} دقايق` : `${mins} دقيقة`;
  if (km < 0.8) {
    return {
      short: `أقل من كيلو · ~${minLabel}`,
      detailed: `جنبك بأقل من كيلو (حوالي ${minLabel})`,
      mins
    };
  }
  const roundedKm = km < 10 ? Math.round(km * 2) / 2 : Math.round(km);
  return {
    short: `${roundedKm} كم · ~${minLabel}`,
    detailed: `يبعد ${roundedKm} كم (حوالي ${minLabel})`,
    mins
  };
}

/** تحديد أقرب محافظة ومدينة مصرية تلقائياً من إحداثيات الـ GPS بلمسة واحدة (#11) */
export function findNearestLocation(
  lat: number,
  lng: number,
  cityXY: Record<string, number[]>,
  govXY: Record<string, number[]>,
  govOfFn: (city: string) => string
): { g: string; c: string; distKm: number } | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const hav = (a: number[], b: number[]) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const h =
      Math.sin(toRad(b[0] - a[0]) / 2) ** 2 +
      Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(toRad(b[1] - a[1]) / 2) ** 2;
    return 12742 * Math.asin(Math.sqrt(h));
  };

  let bestCity = '';
  let bestGov = '';
  let minKm = Infinity;

  for (const [city, xy] of Object.entries(cityXY)) {
    const d = hav([lat, lng], xy);
    if (d < minKm) {
      minKm = d;
      bestCity = city;
      bestGov = govOfFn(city);
    }
  }

  for (const [gov, xy] of Object.entries(govXY)) {
    const d = hav([lat, lng], xy);
    if (d + 8 < minKm) {
      minKm = d;
      bestGov = gov;
      bestCity = '';
    }
  }

  if (!bestGov) return null;
  return { g: bestGov, c: bestCity || bestGov, distKm: Math.round(minKm * 10) / 10 };
}

/** ترميز وفك ترميز البطاقات التفاعلية داخل الشات: مشاركة الموقع الحي (#32) وبطاقة تأكيد الاتفاق (#33) */
export interface ParsedChatSpecial {
  type: 'text' | 'pin' | 'deal';
  text: string;
  lat?: number;
  lng?: number;
  label?: string;
  mapUrl?: string;
  price?: number;
  when?: string;
  note?: string;
  dealStatus?: 'pending' | 'accepted';
}

export function encodeLocationPinMsg(lat: number, lng: number, label = 'موقعي الحالي للمعاينة والتنفيذ'): string {
  const safeLat = Number(lat).toFixed(5);
  const safeLng = Number(lng).toFixed(5);
  const cleanLbl = String(label || 'موقعي الحالي').replace(/\|/g, ' ').trim();
  return `[WASLA_PIN]|${safeLat}|${safeLng}|${cleanLbl}`;
}

export function encodeDealHandshakeMsg(
  price: number,
  when: string,
  note: string,
  status: 'pending' | 'accepted' = 'pending'
): string {
  const p = Math.max(1, Math.round(Number(price) || 0));
  const w = String(when || 'في أقرب وقت').replace(/\|/g, ' ').trim();
  const n = String(note || 'اتفاق تنفيذ خدمة على وصلة').replace(/\|/g, ' ').trim();
  return `[WASLA_DEAL]|${p}|${w}|${n}|${status}`;
}

export function parseSpecialChatMessage(rawText: string): ParsedChatSpecial {
  const s = String(rawText || '').trim();
  if (s.startsWith('[WASLA_PIN]|')) {
    const parts = s.split('|');
    const lat = Number(parts[1]);
    const lng = Number(parts[2]);
    const label = parts[3] || 'موقع جغرافي مشترك';
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return {
        type: 'pin',
        text: label,
        lat,
        lng,
        label,
        mapUrl: `https://www.google.com/maps?q=${lat},${lng}`
      };
    }
  }
  if (s.startsWith('[WASLA_DEAL]|')) {
    const parts = s.split('|');
    const price = Number(parts[1]) || 0;
    const when = parts[2] || 'حسب الاتفاق';
    const note = parts[3] || 'تنفيذ الخدمة المتفق عليها';
    const dealStatus = parts[4] === 'accepted' ? 'accepted' : 'pending';
    if (price > 0) {
      return {
        type: 'deal',
        text: note,
        price,
        when,
        note,
        dealStatus
      };
    }
  }
  return { type: 'text', text: s };
}

/** تجميع الإشعارات المتشابهة بشكل ذكي وأنيق (#37) */
export function groupNotificationsSmart(notifs: any[]): any[] {
  if (!Array.isArray(notifs) || notifs.length <= 1) return notifs || [];
  const out: any[] = [];
  const byKindAndReq = new Map<string, any>();

  for (const n of notifs) {
    const groupKey = n.reqId
      ? `req_${n.reqId}`
      : n.kind === 'publish' && String(n.badge || '').includes('المحفوظات')
      ? 'group_bookmarks'
      : '';

    if (groupKey && byKindAndReq.has(groupKey)) {
      const existing = byKindAndReq.get(groupKey);
      existing.groupedCount = (existing.groupedCount || 1) + 1;
      existing.count = Math.max(existing.count || 0, n.count || 0, existing.groupedCount);
      if (!existing.actors) existing.actors = ['أحمد', 'محمد', 'محمود'];
      continue;
    }

    const cloned = {
      ...n,
      groupedCount: n.count > 1 ? n.count : 1,
      actors: n.count >= 2 ? ['أحمد', 'محمد', 'صنايعي'] : []
    };
    if (groupKey) byKindAndReq.set(groupKey, cloned);
    out.push(cloned);
  }

  return out;
}

/**
 * التحقق الصارم من وجود طلب خدمة مكتمل فعلياً بين الطرفين قبل السماح بوضع علامة تحذير / إبلاغ
 * (لا يُسمح بالإبلاغ بمجرد إرسال رسالة في الشات أو وجود طلب غير مكتمل)
 */
export function hasCompletedDealBetween(
  myUid: string,
  targetUid: string,
  reqs: any[],
  reviews: any[]
): { ok: boolean; type: string; label: string; reqId?: string } | null {
  if (!myUid || !targetUid || myUid === targetUid) return null;

  // 1) طلب يملكه المستخدم الحالي وتم اكتماله فعلياً مع هذا الصنايعي
  const myCompletedReq = (reqs || []).find(
    r =>
      (r.mine || r.ownerId === myUid) &&
      r.rawStatus === 'completed' &&
      (r.completedProviderId === targetUid ||
        (r.offers || []).some((o: any) => o.providerId === targetUid && o.s === 1) ||
        (r.offers || []).some((o: any) => o.providerId === targetUid && o.s !== 2))
  );
  if (myCompletedReq) {
    return {
      ok: true,
      type: 'completed_req_owner',
      label: `طلب خدمة مكتمل بينكما: «${myCompletedReq.t}»`,
      reqId: myCompletedReq.id
    };
  }

  // 2) طلب يملكه الطرف الآخر وتم اكتماله فعلياً مع المستخدم الحالي كمقدم خدمة
  const theirCompletedReq = (reqs || []).find(
    r =>
      r.ownerId === targetUid &&
      r.rawStatus === 'completed' &&
      (r.completedProviderId === myUid ||
        (r.offers || []).some((o: any) => o.providerId === myUid && o.s !== 2))
  );
  if (theirCompletedReq) {
    return {
      ok: true,
      type: 'completed_req_provider',
      label: `طلب خدمة مكتمل قمت بتنفيذه: «${theirCompletedReq.t}»`,
      reqId: theirCompletedReq.id
    };
  }

  // 3) تقييم معاملة مكتملة وموثّقة بالفعل بين الطرفين
  const verifiedRev = (reviews || []).find(
    rv =>
      rv.verifiedDeal &&
      ((rv.providerId === targetUid && rv.customerId === myUid) ||
        (rv.providerId === myUid && rv.customerId === targetUid))
  );
  if (verifiedRev) {
    return {
      ok: true,
      type: 'verified_review',
      label: 'معاملة خدمة مكتملة وموثّقة على وصلة'
    };
  }

  return null;
}
