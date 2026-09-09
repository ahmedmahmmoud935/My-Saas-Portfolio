// Landing-page default copy (AR/EN). The owner can override any of these
// from the dashboard; saved values are merged over these defaults.
export const LANDING_COPY = {
  ar: {
    nav: { features: 'المميزات', how: 'الطريقة', showcase: 'أمثلة', compare: 'ليه إحنا؟', pricing: 'الأسعار', faq: 'الأسئلة' },
    cta: 'ابدأ الآن',
    login: 'دخول',
    tagline: 'SHOW. GROW. WIN.',
    heroEyebrow: 'منصة بورتفوليو متعدّدة المستخدمين',
    heroTitle: 'بورتفوليو احترافي،',
    heroTitleAccent: 'في دقائق.',
    heroSub:
      'اعرض مشاريعك وريلزك ومقالاتك في موقع سريع ومتجاوب — بالعربي والإنجليزي، على دومينك الخاص، من غير كود.',
    // Percentages over what the page already chose. Arabic and English are
    // sized separately on purpose: the same headline is not the same length,
    // and Cairo does not sit on the line the way Montserrat does.
    heroScale: 100,
    heroLeading: 100,
    heroBtn1: 'اطلب بورتفوليو',
    heroBtn2: 'شوف مثال حي',
    // The dashboard-and-portfolio picture in the hero. Labels, not screenshots,
    // so the picture translates and never goes stale against the real product.
    panelEyebrow: 'شكل المنتج',
    panelHeading: 'لوحة تحكم واحدة، وموقع بيتبني منها',
    panelTitle: 'لوحة التحكم والموقع',
    mock: {
      panel: 'لوحة التحكم',
      items: ['المشاريع والريلز', 'الهايلايتس', 'المظهر والألوان', 'التحليلات'],
      circles: ['ريلز', 'آراء العملاء', 'الخدمات'],
      cards: ['مونتاج بودكاست', 'إعلان موشن', 'هوية بصرية'],
    },
    metricsLabels: { sites: 'بورتفوليو منشور', projects: 'مشروع معروض', visits: 'زيارة للأعمال' },
    featuresEyebrow: 'المميزات',
    featuresTitle: 'كل اللي تحتاجه في مكان واحد',
    features: [
      { icon: '🎨', iconUrl: '', bgUrl: '', t: 'تصميم قابل للتخصيص', d: 'ألوان وخطوط وأقسام قابلة للترتيب من لوحة تحكم عربية بالكامل.' },
      { icon: '🖼️', iconUrl: '', bgUrl: '', t: 'مشاريع وريلز', d: 'شبكات صور، عارض ريلز عمودي 9:16، ستوري هايلايتس، وصفحات تفاصيل للمشاريع.' },
      { icon: '✍️', iconUrl: '', bgUrl: '', t: 'مدوّنة ومقالات', d: 'محرّر غني + HTML خام، مع SEO و JSON-LD لكل مقال.' },
      { icon: '🌐', iconUrl: '', bgUrl: '', t: 'دومينك الخاص', d: 'اربط دومينك بضغطة، مع شهادة SSL تلقائية.' },
      { icon: '⚡', iconUrl: '', bgUrl: '', t: 'سريع و SEO', d: 'صور WebP، Sitemap، بيانات منظّمة، وتحميل كسول للأداء.' },
      { icon: '📩', iconUrl: '', bgUrl: '', t: 'نموذج تواصل شغّال', d: 'رسائل العملاء توصلك على إيميلك مباشرة، مع صفحة آراء عامة.' },
    ],
    howEyebrow: 'الطريقة',
    howTitle: 'ثلاث خطوات وخلاص',
    how: [
      { n: '1', iconUrl: '', t: 'سجّل دخولك', d: 'ادخل لوحة التحكم وابدأ من قالب جاهز.' },
      { n: '2', iconUrl: '', t: 'ضيف محتواك', d: 'ارفع مشاريعك وصورك ومقالاتك ورتّب الأقسام.' },
      { n: '3', iconUrl: '', t: 'انشر', d: 'اربط دومينك وشارك موقعك مع العالم.' },
    ],
    showcaseEyebrow: 'أمثلة حيّة',
    showcaseTitle: 'بورتفوليوهات حيّة على المنصة',
    showcaseEmpty: 'قريباً — أول البورتفوليوهات في الطريق.',
    visit: 'زيارة',
    compareEyebrow: 'مقارنة',
    compareTitle: 'ليه موقعك الخاص أفضل من رابط عام؟',
    compareOldTitle: 'رابط درايف أو منصة عامة',
    compareOld: [
      'العميل بيشوف شغل منافسينك جنب شغلك.',
      'الفيديو بيتحمّل بصعوبة، والريلز بتتعرض غلط.',
      'رابط طويل ومش باسمك، بيقلّل من قيمة سعرك.',
      'مفيش زرار تواصل — العميل لازم يدوّر عليك.',
    ],
    compareNewTitle: 'بورتفوليو على ViralPX',
    compareNew: [
      'الصفحة كلها باسمك وشغلك انت بس.',
      'عارض ريلز ٩:١٦ سريع، ومظبوط على الموبايل.',
      'دومينك الخاص — أول انطباع محترف.',
      'زرار واتساب وتواصل في متناول إيد العميل.',
    ],
    pricingEyebrow: 'الأسعار',
    pricingTitle: 'أسعار بسيطة',
    plans: [
      { name: 'مجاني', price: '0', per: 'للأبد', feats: ['بورتفوليو واحد', 'رابط ViralPX', 'مشاريع ومقالات', 'مساحة 1GB'], cta: 'ابدأ مجاناً', hi: false },
      { name: 'برو', price: '199', per: 'شهرياً', feats: ['دومينك الخاص + SSL', 'مساحة أكبر', 'إزالة العلامة', 'أولوية الدعم'], cta: 'اشترك في برو', hi: true },
    ],
    faqEyebrow: 'إجابات سريعة',
    faqTitle: 'أسئلة شائعة',
    faqs: [
      { q: 'محتاج أعرف كود؟', a: 'لأ خالص. كل حاجة من لوحة تحكم عربية بالسحب والإفلات.' },
      { q: 'أقدر أربط دوميني؟', a: 'أيوه، في خطة برو تربط دومينك بشهادة SSL تلقائية.' },
      { q: 'الموقع بيدعم العربي والإنجليزي؟', a: 'أيوه، ثنائي اللغة مع دعم كامل للاتجاه من اليمين لليسار.' },
      { q: 'بياناتي في أمان؟', a: 'كل مستخدم معزول تماماً عن غيره، والصور على CDN آمن.' },
    ],
    ctaTitle: 'جاهز تطلق بورتفوليوك؟',
    ctaSub: 'ابدأ دلوقتي — أول بورتفوليو مجاني.',
    ctaBtn: 'ابدأ الآن',
    footerNote: 'منصة بورتفوليو للمصممين وصنّاع المحتوى العرب.',
    footerLinksTitle: 'روابط',
    // Add, rename, repoint or delete these from the dashboard. A path starting
    // with '#' jumps to a section of this page; anything else is a full link.
    footerLinks: [
      { label: 'الأسعار', url: '#pricing' },
      { label: 'الأسئلة', url: '#faq' },
    ],
    rights: 'كل الحقوق محفوظة',
  },
  en: {
    nav: { features: 'Features', how: 'How it works', showcase: 'Showcase', compare: 'Why us', pricing: 'Pricing', faq: 'FAQ' },
    cta: 'Get started',
    login: 'Log in',
    tagline: 'SHOW. GROW. WIN.',
    heroEyebrow: 'Multi-tenant portfolio platform',
    heroTitle: 'A professional portfolio,',
    heroTitleAccent: 'in minutes.',
    heroSub:
      'Show your projects, reels and articles on a fast, responsive site — Arabic & English, on your own domain, no code.',
    heroScale: 100,
    heroLeading: 100,
    heroBtn1: 'Request a portfolio',
    heroBtn2: 'See a live example',
    panelEyebrow: 'A look inside',
    panelHeading: 'One dashboard, and the site it publishes',
    panelTitle: 'The dashboard and the site',
    mock: {
      panel: 'Dashboard',
      items: ['Projects & reels', 'Highlights', 'Look & colours', 'Analytics'],
      circles: ['Reels', 'Testimonials', 'Services'],
      cards: ['Podcast edit', 'Motion ad', 'Brand identity'],
    },
    metricsLabels: { sites: 'portfolios published', projects: 'projects on show', visits: 'visits to the work' },
    featuresEyebrow: 'Features',
    featuresTitle: 'Everything you need, in one place',
    features: [
      { icon: '🎨', iconUrl: '', bgUrl: '', t: 'Customizable design', d: 'Colors, fonts and reorderable sections from a full dashboard.' },
      { icon: '🖼️', iconUrl: '', bgUrl: '', t: 'Projects & reels', d: 'Image grids, a 9:16 vertical reels player, story highlights and project pages.' },
      { icon: '✍️', iconUrl: '', bgUrl: '', t: 'Blog & articles', d: 'Rich editor + raw HTML, with SEO and JSON-LD per article.' },
      { icon: '🌐', iconUrl: '', bgUrl: '', t: 'Your own domain', d: 'Connect your domain in a click, with automatic SSL.' },
      { icon: '⚡', iconUrl: '', bgUrl: '', t: 'Fast & SEO-ready', d: 'WebP images, sitemap, structured data and lazy loading.' },
      { icon: '📩', iconUrl: '', bgUrl: '', t: 'Working contact form', d: 'Client messages reach your inbox, plus a public reviews page.' },
    ],
    howEyebrow: 'How it works',
    howTitle: 'Three steps, done',
    how: [
      { n: '1', iconUrl: '', t: 'Log in', d: 'Open the dashboard and start from a ready template.' },
      { n: '2', iconUrl: '', t: 'Add your content', d: 'Upload projects, images and articles, arrange sections.' },
      { n: '3', iconUrl: '', t: 'Publish', d: 'Connect your domain and share with the world.' },
    ],
    showcaseEyebrow: 'Live examples',
    showcaseTitle: 'Live portfolios on the platform',
    showcaseEmpty: 'Coming soon — the first portfolios are on the way.',
    visit: 'Visit',
    compareEyebrow: 'Comparison',
    compareTitle: 'Why your own site beats a shared link',
    compareOldTitle: 'A drive link or a shared platform',
    compareOld: [
      'Your competitors\u2019 work sits beside your own.',
      'Video loads badly, and vertical reels are shown wrong.',
      'A long link that is not your name, and it shows in your rate.',
      'No way to get in touch — the client has to go looking.',
    ],
    compareNewTitle: 'A portfolio on ViralPX',
    compareNew: [
      'The whole page is your name and your work alone.',
      'A fast 9:16 reel player, built for phones.',
      'Your own domain — a professional first impression.',
      'Contact and WhatsApp buttons within reach.',
    ],
    pricingEyebrow: 'Pricing',
    pricingTitle: 'Simple pricing',
    plans: [
      { name: 'Free', price: '0', per: 'forever', feats: ['One portfolio', 'ViralPX link', 'Projects & articles', '1GB storage'], cta: 'Start free', hi: false },
      { name: 'Pro', price: '199', per: '/mo', feats: ['Your own domain + SSL', 'More storage', 'Remove branding', 'Priority support'], cta: 'Go Pro', hi: true },
    ],
    faqEyebrow: 'Quick answers',
    faqTitle: 'Frequently asked',
    faqs: [
      { q: 'Do I need to code?', a: 'Not at all. Everything is drag-and-drop from the dashboard.' },
      { q: 'Can I use my own domain?', a: 'Yes — the Pro plan connects your domain with automatic SSL.' },
      { q: 'Is it bilingual?', a: 'Yes, Arabic & English with full right-to-left support.' },
      { q: 'Is my data isolated?', a: 'Every tenant is fully isolated, and media is served from a secure CDN.' },
    ],
    ctaTitle: 'Ready to launch your portfolio?',
    ctaSub: 'Start now — your first portfolio is free.',
    ctaBtn: 'Get started',
    footerNote: 'A portfolio platform for Arabic designers and creators.',
    footerLinksTitle: 'Links',
    footerLinks: [
      { label: 'Pricing', url: '#pricing' },
      { label: 'FAQ', url: '#faq' },
    ],
    rights: 'All rights reserved',
  },
}

export type LandingCopy = (typeof LANDING_COPY)['ar']

/**
 * Saved copy laid over the defaults.
 *
 * A plain spread is not enough. Copy saved before a field existed replaces the
 * whole group it belongs to — a saved `nav` written before the comparison link
 * was added wipes that link out entirely, and the page renders a blank one.
 * The groups that hold named fields are merged a level deeper so a new field
 * survives old saved content; the lists are not, because a list is edited as a
 * whole and merging one by index would resurrect a line somebody deleted.
 */
export function mergeCopy(base: LandingCopy, saved: unknown): LandingCopy {
  if (!saved || typeof saved !== 'object') return base
  const s = saved as Partial<LandingCopy>
  const group = <K extends 'nav' | 'mock' | 'metricsLabels'>(k: K): LandingCopy[K] =>
    s[k] && typeof s[k] === 'object' ? { ...base[k], ...(s[k] as object) } : base[k]
  return {
    ...base,
    ...s,
    nav: group('nav'),
    mock: group('mock'),
    metricsLabels: group('metricsLabels'),
  }
}
