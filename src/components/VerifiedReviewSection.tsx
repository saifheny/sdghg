import React, { useEffect, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { safeImgUrl } from '../security/shield';

export interface ReviewItem {
  id: string;
  providerId: string;
  customerId: string;
  requestId: string;
  by: string;
  photo: string;
  preset: string;
  stars: number;
  comment: string;
  verifiedDeal: boolean;
  ts: number;
  ago: string;
}

export interface CompletedDealInfo {
  id: string;
  title: string;
}

export interface VerifiedReviewProps {
  providerUid: string;
  providerName: string;
  isMe: boolean;
  isSignedIn: boolean;
  avgVal: number;
  shownCount: number;
  reviews: ReviewItem[];
  myRev: ReviewItem | null;
  initialStars: number;
  completedDeals: CompletedDealInfo[];
  agreedDeal: CompletedDealInfo | null;
  onStarChange: (stars: number) => void;
  onReadyForVoice: (container: HTMLElement | null) => void;
}

const STAR_LABELS = [
  '',
  'ضعيف (1/5)',
  'مقبول (2/5)',
  'كويس (3/5)',
  'شاطر ومحترم (4/5)',
  'معلّم وشغل نظيف! (5/5)'
];

const AV_COLORS = ['#4BD4BE', '#FFE26A', '#9C89FF', '#FA6B63', '#55B9DB', '#F7A56C', '#FAD2CC'];
const BEARS: Record<string, [string, string, string, string]> = {
  orange: ['#F7A56C', '#FFD5B5', '#FFF0E3', '#1B1B1B'],
  lav: ['#9C89FF', '#D6CEFF', '#F2EFFF', '#1B1B1B'],
  pink: ['#FA6B63', '#FAD2CC', '#FFF0EE', '#1B1B1B'],
  sky: ['#55B9DB', '#BCE6F5', '#ECFAFF', '#1B1B1B'],
  mint: ['#4BD4BE', '#B3F0E5', '#E8FCF8', '#1B1B1B'],
  sun: ['#FFE26A', '#FFF1B2', '#FFFBE6', '#1B1B1B']
};

const PRE: Array<[string, string]> = [
  ['bear:orange', '#FFE8D4'],
  ['bear:mint', '#DDF9F3'],
  ['bear:lav', '#EAE5FF'],
  ['bear:sun', '#FFF5C2'],
  ['bear:sky', '#DCF3FA'],
  ['bear:pink', '#FAD2CC'],
  ['rocket', '#FAD2CC'],
  ['crown', '#FFE26A'],
  ['lightning', '#9C89FF'],
  ['smiley', '#4BD4BE']
];

function colorForName(name: string): string {
  let h = 0;
  const s = String(name || 'م');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return AV_COLORS[h % AV_COLORS.length];
}

function StarIcon({ size = 14, filled = false }: { size?: number; filled?: boolean }) {
  return (
    <svg className="ic" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      {filled ? (
        <path d="M234.29,114.85l-45,38.83L203,211.75a16.4,16.4,0,0,1-24.5,17.82L128,198.49,77.47,229.57A16.4,16.4,0,0,1,53,211.75l13.76-58.07-45-38.83A16.46,16.46,0,0,1,31.08,86l59-4.76,22.76-55.08a16.36,16.36,0,0,1,30.27,0l22.75,55.08,59,4.76a16.46,16.46,0,0,1,9.37,28.86Z" />
      ) : (
        <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Zm-15.34,5.47-48.7,42a8,8,0,0,0-2.56,7.91l14.88,62.8a.37.37,0,0,1-.17.48c-.18.14-.23.11-.38,0l-54.72-33.65a8,8,0,0,0-8.38,0L69.09,215.94c-.15.09-.19.12-.38,0a.37.37,0,0,1-.17-.48l14.88-62.8a8,8,0,0,0-2.56-7.91l-48.7-42c-.12-.1-.23-.19-.13-.5s.18-.27.33-.29l63.92-5.16A8,8,0,0,0,103,91.86l24.62-59.61c.08-.17.11-.25.35-.25s.27.08.35.25L153,91.86a8,8,0,0,0,6.75,4.92l63.92,5.16c.15,0,.24,0,.33.29S224,102.63,223.84,102.73Z" />
      )}
    </svg>
  );
}

function SealIcon({ size = 18 }: { size?: number }) {
  return (
    <svg className="ic" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      <path d="M225.86,102.82c-3.77-3.94-7.67-8-9.14-11.57-1.36-3.27-1.44-8.69-1.52-13.94-.15-9.76-.31-20.82-8-28.51s-18.75-7.85-28.51-8c-5.25-.08-10.67-.16-13.94-1.52-3.56-1.47-7.63-5.37-11.57-9.14C146.28,23.51,138.44,16,128,16s-18.27,7.51-25.18,14.14c-3.94,3.77-8,7.67-11.57,9.14C88,40.64,82.56,40.72,77.31,40.8c-9.76.15-20.82.31-28.51,8S41,67.55,40.8,77.31c-.08,5.25-.16,10.67-1.52,13.94-1.47,3.56-5.37,7.63-9.14,11.57C23.51,109.72,16,117.56,16,128s7.51,18.27,14.14,25.18c3.77,3.94,7.67,8,9.14,11.57,1.36,3.27,1.44,8.69,1.52,13.94.15,9.76.31,20.82,8,28.51s18.75,7.85,28.51,8c5.25.08,10.67.16,13.94,1.52,3.56,1.47,7.63,5.37,11.57,9.14C109.72,232.49,117.56,240,128,240s18.27-7.51,25.18-14.14c3.94-3.77,8-7.67,11.57-9.14,3.27-1.36,8.69-1.44,13.94-1.52,9.76-.15,20.82-.31,28.51-8s7.85-18.75,8-28.51c.08-5.25.16-10.67,1.52-13.94,1.47-3.56,5.37-7.63,9.14-11.57C232.49,146.28,240,138.44,240,128S232.49,109.73,225.86,102.82ZM173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34Z" />
    </svg>
  );
}

function BearSvg({ size = 64, kind = 'mint' }: { size?: number; kind?: string }) {
  const c = BEARS[kind] || BEARS.mint;
  return (
    <svg className="bear" width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="30" cy="34" r="17" fill={c[0]} stroke={c[3]} strokeWidth="3.5" />
      <circle cx="30" cy="34" r="8.5" fill={c[1]} />
      <circle cx="90" cy="34" r="17" fill={c[0]} stroke={c[3]} strokeWidth="3.5" />
      <circle cx="90" cy="34" r="8.5" fill={c[1]} />
      <ellipse cx="60" cy="66" rx="44" ry="40" fill={c[0]} stroke={c[3]} strokeWidth="3.5" />
      <ellipse cx="33" cy="78" rx="7.5" ry="5" fill="#FA6B63" opacity=".45" />
      <ellipse cx="87" cy="78" rx="7.5" ry="5" fill="#FA6B63" opacity=".45" />
      <ellipse cx="60" cy="78" rx="18" ry="13.5" fill={c[2]} stroke={c[3]} strokeWidth="2.6" />
      <ellipse cx="60" cy="72" rx="6" ry="4.4" fill={c[3]} />
      <path d="M60 76v5M52 82c3 5 13 5 16 0" fill="none" stroke={c[3]} strokeWidth="2.8" strokeLinecap="round" />
      <circle cx="43" cy="60" r="4.8" fill={c[3]} />
      <circle cx="77" cy="60" r="4.8" fill={c[3]} />
      <circle cx="44.5" cy="58.5" r="1.5" fill="#fff" />
      <circle cx="78.5" cy="58.5" r="1.5" fill="#fff" />
    </svg>
  );
}

function SafeAvatar({ size, name, photo, preset }: { size: number; name: string; photo?: string; preset?: string }) {
  const cleanName = String(name || 'م').trim() || 'م';
  const ch = cleanName.charAt(0);
  const validPhoto = safeImgUrl(photo);
  let bg = colorForName(cleanName);
  const presetEntry = preset && preset.startsWith('p') ? PRE[Number(preset.slice(1))] : undefined;
  if (!validPhoto && presetEntry) {
    bg = presetEntry[1];
  }

  return (
    <span
      className="avx"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${Math.round(size * 0.42)}px`,
        background: bg
      }}
    >
      {validPhoto ? (
        <img src={validPhoto} alt={ch} referrerPolicy="no-referrer" data-fbk={ch} />
      ) : presetEntry && presetEntry[0].startsWith('bear:') ? (
        <BearSvg size={Math.round(size * 0.88)} kind={presetEntry[0].slice(5)} />
      ) : (
        ch
      )}
    </span>
  );
}

export function VerifiedReviewSection(props: VerifiedReviewProps) {
  const {
    providerUid,
    providerName,
    isMe,
    avgVal,
    shownCount,
    reviews,
    myRev,
    initialStars,
    completedDeals,
    agreedDeal,
    onStarChange,
    onReadyForVoice
  } = props;

  const [stars, setStars] = useState<number>(initialStars || 5);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setStars(initialStars || 5);
  }, [initialStars, providerUid]);

  useEffect(() => {
    if (containerRef.current) {
      onReadyForVoice(containerRef.current);
    }
  }, [providerUid, completedDeals.length, myRev?.id]);

  const totalRevs = reviews.length;
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const rv of reviews) {
    counts[rv.stars] = (counts[rv.stars] || 0) + 1;
  }

  const canWriteVerifiedReview = !isMe && (completedDeals.length > 0 || Boolean(myRev && myRev.verifiedDeal));
  const activeDealTitle = completedDeals[0]?.title || '';

  const pickStar = (val: number) => {
    const clamped = Math.max(1, Math.min(5, val));
    setStars(clamped);
    onStarChange(clamped);
  };

  return (
    <div ref={containerRef} data-react-verified-reviews="1">
      <div className="sech">
        <h5 className="sec">التقييمات وآراء العملاء الموثّقة</h5>
      </div>

      <div className="rate-summary">
        <div className="rate-big">
          <strong>{shownCount > 0 ? avgVal.toFixed(1) : '—'}</strong>
          <span style={{ display: 'inline-flex', gap: '2px' }}>
            {[1, 2, 3, 4, 5].map(n => (
              <StarIcon key={n} size={14} filled={n <= Math.round(avgVal || 5)} />
            ))}
          </span>
          <small>{shownCount > 0 ? `${shownCount} تقييم موثّق` : 'لسه أول تقييم'}</small>
        </div>
        <div className="rate-bars">
          {[5, 4, 3, 2, 1].map(st => {
            const c = counts[st] || 0;
            const pct = totalRevs ? Math.round((c / totalRevs) * 100) : 0;
            return (
              <div className="rbar-row" key={st}>
                <span>{st} ★</span>
                <div className="rbar-track">
                  <div className="rbar-fill" style={{ width: `${pct}%` }} />
                </div>
                <small>{c}</small>
              </div>
            );
          })}
        </div>
      </div>

      {isMe ? (
        <div
          className="ofr"
          style={{
            background: 'var(--sun)',
            borderStyle: 'solid',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            marginBottom: '12px'
          }}
        >
          <span>
            <b>دي صفحتك الشخصية العامة!</b> التقييمات هنا محمية وموثّقة — العملاء اللي نفّذتلهم خدمات فعلية بس هم اللي يقدروا يقيّموا شغلك.
          </span>
          <button className="btn sm white" type="button" data-a="shareProv" data-uid={providerUid}>
            انسخ رابط صفحتي
          </button>
        </div>
      ) : canWriteVerifiedReview ? (
        <div className="rev-write">
          {activeDealTitle ? (
            <span className="rev-deal-pill">
              <SealIcon size={15} />
              <span>خدمة منفّذة وموثّقة: «{activeDealTitle}»</span>
            </span>
          ) : (
            <span className="rev-deal-pill">
              <SealIcon size={15} />
              <span>معاملة مكتملة وموثّقة ✓</span>
            </span>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
            <b>{myRev ? 'عدّل تقييمك للخدمة اللي استلمتها' : 'استلمت الخدمة؟ اكتب تقييمك الموثّق'}</b>
            <small>تقدر تكتب بإيدك أو تدوس ع المايك وتتكلم</small>
          </div>
          <div className="star-pick" id="rev-stars-box">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                className={`star-btn${n <= stars ? ' on' : ''}`}
                aria-label={`${n} نجوم`}
                onClick={() => pickStar(n)}
              >
                <StarIcon size={22} filled={true} />
              </button>
            ))}
            <span className="tag st" style={{ marginInlineStart: '4px' }}>
              {STAR_LABELS[stars] || ''}
            </span>
          </div>
          <div className="field">
            <textarea
              key={`${providerUid}_${myRev ? myRev.id : 'new'}`}
              id="rev-txt"
              defaultValue={myRev ? myRev.comment : ''}
              placeholder="احكي تجربتك بصراحة في الشغل والمواعيد والمعاملة.. أو دوس على زرار الصوت واتكلم وهيكتب لوحده!"
            />
          </div>
          <div className="meta">
            <button className="btn coral" type="button" data-a="postRev">
              {myRev ? 'تحديث تقييمي الموثّق ✓' : 'انشر التقييم دلوقتي ✓'}
            </button>
            {myRev ? (
              <button className="btn sm danger" type="button" data-a="delMyRev" data-i={myRev.id}>
                مسح تقييمي
              </button>
            ) : null}
          </div>
        </div>
      ) : agreedDeal ? (
        <div className="rev-gate agreed" id="rev-verified-gate">
          <div className="rev-gate-head">
            <SealIcon size={18} />
            <span>عندك طلب متفق عليه مع {providerName}: «{agreedDeal.title}»</span>
          </div>
          <p>
            علشان التقييمات تفضل حقيقية 100%، أكّد الأول إن الخدمة خلصت واستلمت الشغل تمام، وهتقدر تنشر تقييمك الموثّق فوراً في نفس اللحظة.
          </p>
          <div className="meta">
            <button className="btn sm mint" type="button" data-a="done" data-i={agreedDeal.id}>
              تأكيد إتمام الخدمة وكتابة التقييم ✓
            </button>
          </div>
        </div>
      ) : (
        <div className="rev-gate" id="rev-verified-gate">
          <div className="rev-gate-head">
            <SealIcon size={18} />
            <span>التقييم متاح فقط للعملاء اللي نفّذوا خدمة فعلية مع {providerName}</span>
          </div>
          <p>
            حمايةً لمصداقية الموقع ومنع التقييمات الوهمية أو الكيدية، محدش يقدر يضيف تقييم إلا بعد إتمام طلب خدمة حقيقي ومكتمل مع مقدم الخدمة على وصلة.
          </p>
        </div>
      )}

      {reviews.length > 0 ? (
        <div className="list single">
          {reviews.map(rv => (
            <article className="rev-card" key={rv.id}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                <div
                  className={`who${rv.customerId ? ' who-link' : ''}`}
                  data-a={rv.customerId ? 'prof' : undefined}
                  data-uid={rv.customerId || undefined}
                  data-n={rv.customerId ? rv.by : undefined}
                  data-ph={rv.customerId ? rv.photo || '' : undefined}
                  data-pr={rv.customerId ? rv.preset || '' : undefined}
                >
                  <SafeAvatar size={38} name={rv.by} photo={rv.photo} preset={rv.preset} />
                  <div>
                    <b>{rv.by}</b>
                    <small>{rv.ago}</small>
                  </div>
                </div>
                <div className="meta">
                  <span className="tag st">
                    {'★'.repeat(rv.stars)}
                    {'☆'.repeat(5 - rv.stars)} ({rv.stars}/5)
                  </span>
                  {rv.verifiedDeal ? <span className="tag mint">خدمة منفّذة ✓</span> : null}
                </div>
              </div>
              {rv.comment ? <p>{rv.comment}</p> : <small>قيّم الخدمة بـ {rv.stars} نجوم من غير تعليق مكتوب.</small>}
            </article>
          ))}
        </div>
      ) : (
        <div className="empty2" style={{ padding: '22px 12px' }}>
          <BearSvg size={64} kind="mint" />
          <h4>لسه مفيش تقييمات موثّقة لـ {providerName}</h4>
          <p>
            {isMe
              ? 'أول ما عميل يستلم منك خدمة مكتملة ويقيّم شغلك، هيظهر تقييمه الموثّق هنا للناس كلها.'
              : 'التقييمات هنا حقيقية 100% وتظهر بعد إتمام الخدمات الفعلية مع العملاء.'}
          </p>
        </div>
      )}
    </div>
  );
}

let _activeRoot: Root | null = null;
let _activeHost: Element | null = null;

export function mountVerifiedReviewSection(host: HTMLElement | null, props: VerifiedReviewProps): void {
  if (!host) {
    unmountVerifiedReviewSection();
    return;
  }
  if (_activeHost !== host || !_activeRoot) {
    unmountVerifiedReviewSection();
    _activeHost = host;
    _activeRoot = createRoot(host);
  }
  _activeRoot.render(<VerifiedReviewSection {...props} />);
}

export function unmountVerifiedReviewSection(): void {
  if (_activeRoot) {
    try {
      _activeRoot.unmount();
    } catch {
      // تجاهل لو العنصر اتمسح بالفعل
    }
    _activeRoot = null;
    _activeHost = null;
  }
}
