/**
 * Wasla SEO Kit — كل بيانات الظهور في محركات البحث في مكان واحد.
 * غيّر SITE_URL لو ربطت دومين خاص (مثلاً https://wasla.com.eg/).
 */
export const SITE_URL = 'https://story-97cf7.web.app/';

export const TITLE = 'وصلة | اطلب أي خدمة أو صنايعي قريب منك في مصر';

export const DESCRIPTION =
  'محتاج سباك، كهربائي، نقل عفش، مدرس خصوصي أو أي مساعدة؟ انشر طلبك على وصلة في دقيقة ' +
  'واستقبل عروض أسعار من صنايعية ومقدمي خدمات حقيقيين قريبين منك في كل محافظات مصر.';

/* الخدمات الحقيقية الموجودة في الموقع (نفس CATS و SUBS في wasla-core.ts) */
export const SERVICES = [
  ['نقل وعفش وشحن', ['نقل عفش شقة', 'ربع نقل وبضائع', 'شحن محافظات', 'ونش رفع عفش', 'سحب وإنقاذ عربيات']],
  ['صيانة وصنايعية', ['سباكة', 'كهرباء', 'نجارة', 'نقاشة ودهانات', 'تكييف وتبريد', 'تصليح أجهزة منزلية', 'ألوميتال وحدادة']],
  ['دروس وتعليم', ['دروس خصوصية', 'تأسيس أطفال', 'لغات وكورسات', 'برمجة وكمبيوتر', 'تحفيظ قرآن']],
  ['بيع وشرا ومستعمل', ['موبايلات وإلكترونيات', 'أجهزة كهربائية', 'عفش مستعمل', 'عربيات وموتوسيكلات', 'هدوم ومستلزمات']],
  ['شركات وتشطيبات', ['نظافة شقق بعد التشطيب', 'تشطيب وديكور', 'أمن وحراسة', 'تسويق وتصميم', 'تخليص أوراق ومحاسبة']],
  ['تجارة وتوريد جملة', ['مواد غذائية جملة', 'مستلزمات محلات', 'مواد بناء وتشطيب', 'ملابس ومنسوجات جملة']]
];

export const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'القليوبية', 'الغربية', 'المنوفية',
  'البحيرة', 'كفر الشيخ', 'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'الفيوم', 'بني سويف',
  'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر', 'مطروح',
  'شمال سيناء', 'جنوب سيناء', 'الوادي الجديد'
];

/* كلمات مفتاحية بالعامية والفصحى + الإنجليزي (بدون حشو مبالغ فيه علشان محركات البحث ما تعتبرهوش سبام) */
export const KEYWORDS = [
  'وصلة', 'Wasla', 'محتاج مساعدة', 'عايز صنايعي', 'صنايعي قريب مني', 'أقرب صنايعي', 'خدمات منزلية في مصر',
  'اطلب خدمة', 'عروض أسعار صنايعية', 'مقدمي خدمات', 'فني قريب مني',
  'سباك', 'سباك قريب مني', 'كهربائي', 'كهربائي منازل', 'نجار', 'نقاش', 'دهانات', 'فني تكييف', 'صيانة تكييف',
  'تصليح غسالات', 'تصليح ثلاجات', 'صيانة أجهزة منزلية', 'ألوميتال', 'حداد',
  'نقل عفش', 'نقل أثاث', 'ونش رفع عفش', 'ربع نقل', 'شحن بين المحافظات', 'ونش إنقاذ سيارات',
  'مدرس خصوصي', 'دروس خصوصية', 'تأسيس أطفال', 'كورسات لغات', 'تعليم برمجة', 'محفظ قرآن',
  'تشطيب شقق', 'ديكور', 'نظافة شقق بعد التشطيب', 'شركة تنظيف', 'أمن وحراسة', 'تخليص أوراق',
  'بيع مستعمل', 'عفش مستعمل', 'موبايلات مستعملة', 'توريد جملة', 'مواد بناء',
  'صنايعي القاهرة', 'صنايعي الجيزة', 'صنايعي الإسكندرية', 'صنايعي المنصورة',
  'plumber Egypt', 'electrician Egypt', 'movers Egypt', 'home services Egypt', 'handyman Cairo'
];

export const FAQ = [
  ['إزاي أطلب خدمة أو صنايعي على وصلة؟',
    'اكتب طلبك أو قوله بصوتك، حدد نوع الخدمة ومكانك، وانشره. مقدمي الخدمات القريبين منك هيبعتولك عروض أسعار وتختار الأنسب وتكلمه في الشات.'],
  ['هل لازم أسجل علشان أتصفح الطلبات والصنايعية؟',
    'لا، تقدر تتصفح الموقع كزائر. التسجيل مطلوب بس لما تنشر طلب أو تقدم عرض أو تراسل حد.'],
  ['التقييمات على وصلة حقيقية؟',
    'أيوه، محدش يقدر يقيّم مقدم خدمة غير العميل اللي اتعامل معاه فعلاً واتفق معاه على الشغل.'],
  ['إيه الخدمات اللي ألاقيها على وصلة؟',
    'نقل عفش وشحن، سباكة وكهرباء ونجارة ونقاشة وتكييف، دروس خصوصية وكورسات، تشطيبات ونظافة، بيع وشرا مستعمل، وتوريد جملة — في كل محافظات مصر.'],
  ['ينفع أشتغل على وصلة كمقدم خدمة؟',
    'أيوه، سجّل وفعّل ملفك كمقدم خدمة، وهتوصلك الطلبات القريبة منك وتقدر تبعت عروض أسعار.']
];

const abs = p => new URL(p, SITE_URL).href;

export function jsonLd() {
  const org = {
    '@type': 'Organization',
    '@id': abs('#org'),
    name: 'وصلة',
    alternateName: ['Wasla', 'وصلة للخدمات'],
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: abs('assets/icon-512.png'), width: 512, height: 512 },
    image: abs('assets/og-image.png'),
    description: DESCRIPTION,
    areaServed: { '@type': 'Country', name: 'مصر', identifier: 'EG' }
  };
  const site = {
    '@type': 'WebSite',
    '@id': abs('#site'),
    name: 'وصلة',
    alternateName: 'Wasla',
    url: SITE_URL,
    inLanguage: 'ar-EG',
    publisher: { '@id': abs('#org') }
  };
  const app = {
    '@type': 'WebApplication',
    name: 'وصلة',
    url: SITE_URL,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    inLanguage: 'ar-EG',
    image: abs('assets/og-image.png'),
    publisher: { '@id': abs('#org') }
  };
  const service = {
    '@type': 'Service',
    name: 'طلب خدمات وصنايعية في مصر',
    serviceType: 'منصة ربط العملاء بمقدمي الخدمات',
    provider: { '@id': abs('#org') },
    areaServed: GOVERNORATES.map(g => ({ '@type': 'AdministrativeArea', name: g })),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'خدمات وصلة',
      itemListElement: SERVICES.map(([cat, subs]) => ({
        '@type': 'OfferCatalog',
        name: cat,
        itemListElement: subs.map(s => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s } }))
      }))
    }
  };
  const faq = {
    '@type': 'FAQPage',
    mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
  };
  // منع أي إغلاق للوسم </script> من داخل البيانات
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': [org, site, app, service, faq] }).replace(/</g, '\\u003c');
}

const escAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export function headTags() {
  const og = abs('assets/og-image.png');
  return `<meta name="description" content="${escAttr(DESCRIPTION)}">
<meta name="keywords" content="${escAttr(KEYWORDS.join('، '))}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta name="author" content="وصلة">
<meta name="geo.region" content="EG">
<meta name="geo.placename" content="مصر">
<link rel="canonical" href="${SITE_URL}">
<link rel="alternate" hreflang="ar-EG" href="${SITE_URL}">
<link rel="alternate" hreflang="x-default" href="${SITE_URL}">
<link rel="image_src" href="${og}">
<meta itemprop="name" content="${escAttr(TITLE)}">
<meta itemprop="description" content="${escAttr(DESCRIPTION)}">
<meta itemprop="image" content="${og}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="وصلة">
<meta property="og:locale" content="ar_EG">
<meta property="og:url" content="${SITE_URL}">
<meta property="og:title" content="${escAttr(TITLE)}">
<meta property="og:description" content="${escAttr(DESCRIPTION)}">
<meta property="og:image" content="${og}">
<meta property="og:image:secure_url" content="${og}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="وصلة — نقل عفش، صيانة وصنايعية، دروس، تشطيبات، بيع وشرا، توريد جملة">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escAttr(TITLE)}">
<meta name="twitter:description" content="${escAttr(DESCRIPTION)}">
<meta name="twitter:image" content="${og}">
<meta name="twitter:image:alt" content="وصلة — نقل عفش، صيانة وصنايعية، دروس، تشطيبات، بيع وشرا، توريد جملة">
<script type="application/ld+json">${jsonLd()}</script>`;
}

/* محتوى نصي حقيقي لمحركات البحث والمتصفحات اللي قافلة الجافاسكربت */
export function noscriptBlock() {
  const list = SERVICES.map(([c, subs]) => `<li><strong>${c}:</strong> ${subs.join('، ')}</li>`).join('');
  const faq = FAQ.map(([q, a]) => `<h3>${q}</h3><p>${a}</p>`).join('');
  return `<noscript>
<div class="seo-static">
<h2>وصلة — كل الخدمات والصنايعية حواليك في مصر</h2>
<p>${DESCRIPTION}</p>
<h2>الخدمات المتاحة</h2>
<ul>${list}</ul>
<p>متاحة في: ${GOVERNORATES.join('، ')}.</p>
<h2>أسئلة شائعة</h2>
${faq}
<p>شغّل الجافاسكربت في المتصفح علشان تستخدم الموقع.</p>
</div>
</noscript>`;
}

export function robotsTxt() {
  return `User-agent: *
Allow: /
Disallow: /functions/
Disallow: /src/
Disallow: /scripts/

Sitemap: ${abs('sitemap.xml')}
`;
}

export function sitemapXml() {
  const today = new Date().toISOString().slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${SITE_URL}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image><image:loc>${abs('assets/og-image.png')}</image:loc></image:image>
    <image:image><image:loc>${abs('assets/icon-512.png')}</image:loc></image:image>
  </url>
</urlset>
`;
}
