// Landing-page default copy (AR/EN). The owner can override any of these
// from the dashboard; saved values are merged over these defaults.

/** A quote from someone who uses the product. Empty until there is a real one. */
export type LandingTestimonial = {
  name: string
  role: string
  quote: string
  /** Shared by both languages: a face is not translated. */
  photoUrl: string
  /** Their portfolio, so the quote can be checked against the work. */
  url: string
}

/** One of the pages the footer links to under its legal heading. */
export type LandingLegalPage = { slug: string; title: string; body: string }

export const LANDING_COPY = {
  ar: {
    nav: { features: 'المميزات', how: 'الطريقة', showcase: 'أمثلة', compare: 'ليه إحنا؟', pricing: 'الأسعار', faq: 'الأسئلة' },
    cta: 'ابدأ مجانًا',
    // Where every "start" button on the site goes. One address, not one per
    // button: the page asks for the same thing everywhere, so it sends the
    // reader to the same place everywhere.
    ctaUrl: '/login',
    login: 'دخول',
    tagline: 'SHOW. GROW. WIN.',
    heroEyebrow: 'أول شهر عليك مجانًا',
    heroTitle: 'شغلك يستاهل موقع باسمك،',
    heroTitleAccent: 'مش لينك درايف.',
    heroSub:
      'ViralPX بيحوّل مشاريعك وريلزك ومقالاتك لموقع احترافي على دومينك الخاص — بالعربي والإنجليزي، من غير سطر كود. جرّبه شهر كامل مجانًا بكل المميزات.',
    // Percentages over what the page already chose. Arabic and English are
    // sized separately on purpose: the same headline is not the same length,
    // and Cairo does not sit on the line the way Montserrat does.
    heroScale: 100,
    heroLeading: 100,
    // Two fields, two lines. Off, they flow together as one sentence and wrap
    // wherever the width happens to run out.
    heroTitleBreak: true,
    heroBtn1: 'ابدأ شهرك المجاني',
    heroBtn2: 'شوف بورتفوليو حقيقي',
    heroNote: 'من غير بطاقة دفع · كل المميزات مفتوحة · تلغي في أي وقت',
    // The explainer: a video when there is one, the drawn product until then.
    panelEyebrow: 'شوفها بنفسك',
    panelHeading: 'تعدّل من هنا، يتحدّث هناك.',
    panelSub: 'فيديو قصير بيوريك إزاي تبني بورتفوليو كامل من لوحة التحكم — من غير كود ومن غير مصمم.',
    panelTitle: 'لوحة التحكم والموقع',
    // Per language, because the video is: its subtitles are burned in.
    panelVideo: '',
    panelPoster: '',
    panelDuration: '',
    panelBtn: 'ابدأ شهرك المجاني',
    panelNote: 'نفس اللي شفته، جرّبه بنفسك 30 يوم مجانًا.',
    mock: {
      panel: 'لوحة التحكم',
      items: ['المشاريع والريلز', 'الهايلايتس', 'المظهر والألوان', 'التحليلات'],
      circles: ['ريلز', 'آراء العملاء', 'الخدمات'],
      cards: ['مونتاج بودكاست', 'إعلان موشن', 'هوية بصرية'],
    },
    metricsLabels: { sites: 'بورتفوليو منشور', projects: 'مشروع معروض', visits: 'زيارة للأعمال' },
    featuresEyebrow: 'المميزات',
    featuresTitle: 'كل اللي يخلّي العميل يقول: «عايز أشتغل معاه»',
    featuresSub: 'ومش هتدفع زيادة عشان أي ميزة — كله موجود في كل الخطط.',
    features: [
      // The address is isolated left-to-right: bare, the dot sits between an
      // Arabic word and a Latin one and the pair renders as "com.اسمك".
      { icon: '🌐', iconUrl: '', bgUrl: '', t: 'دومينك الخاص', d: '⁦اسمك.com⁩ بدل لينك طويل — مع شهادة SSL مجانية وتلقائية.' },
      { icon: '🎨', iconUrl: '', bgUrl: '', t: 'تصميم على مقاسك', d: 'ألوانك وخطوطك وترتيب أقسامك — من لوحة التحكم، وبالعربي كامل.' },
      { icon: '🖼️', iconUrl: '', bgUrl: '', t: 'مشاريع وريلز', d: 'عارض ريلز 9:16 وصور وهايلايتس — شغلك يتعرض بالشكل اللي يستاهله.' },
      { icon: '⚡', iconUrl: '', bgUrl: '', t: 'سريع وبيظهر في جوجل', d: 'صور WebP وSitemap وبيانات منظمة — موقع سريع وسهل يلاقوك فيه.' },
      { icon: '✍️', iconUrl: '', bgUrl: '', t: 'مدونة تبني ثقتك', d: 'اكتب مقالاتك مع SEO جاهز لكل مقال — وخلّي خبرتك تتكلم عنك.' },
      { icon: '📩', iconUrl: '', bgUrl: '', t: 'العميل يوصلك فورًا', d: 'نموذج تواصل بيوصل على إيميلك مباشرة، وزر واتساب على موقعك.' },
    ],
    audienceEyebrow: 'لمين؟',
    audienceTitle: 'معمول لكل حد شغله لازم يتشاف',
    audience: ['مصممين جرافيك', 'مونتير وصنّاع ريلز', 'مصورين', 'مصممين UI/UX', 'كتّاب محتوى', 'فريلانسرز'],
    howEyebrow: 'الطريقة',
    howTitle: 'موقعك يبقى جاهز النهارده',
    how: [
      { n: '1', iconUrl: '', t: 'سجّل مجانًا', d: 'ادخل لوحة التحكم وابدأ من قالب جاهز، من غير بطاقة دفع.' },
      { n: '2', iconUrl: '', t: 'ضيف شغلك', d: 'ارفع مشاريعك وريلزك ومقالاتك، ورتّب الأقسام زي ما تحب.' },
      { n: '3', iconUrl: '', t: 'انشر واستقبل عملاء', d: 'اربط دومينك وشارك موقعك، والعملاء يكلموك مباشرة.' },
    ],
    howBtn: 'ابدأ الخطوة الأولى',
    showcaseEyebrow: 'أمثلة حية',
    showcaseTitle: 'مبدعين عرب بيعرضوا شغلهم على ViralPX',
    showcaseSub: 'دوس على أي بورتفوليو وشوف بنفسك التجربة اللي عملاءهم بيشوفوها.',
    showcaseEmpty: 'قريباً — أول البورتفوليوهات في الطريق.',
    visit: 'زور الموقع',
    // Portfolios kept off the page — a test account, an unfinished one. Three
    // real examples sell better than five with placeholders among them.
    showcaseHidden: [] as string[],
    compareEyebrow: 'الفرق',
    compareTitle: 'العميل بيحكم عليك من أول 5 ثواني',
    compareSub: 'لينك الدرايف بيقول إنك بتجرّب. الموقع باسمك بيقول إنك محترف.',
    compareOldTitle: 'لينك درايف أو منصة عامة',
    compareOld: [
      'العميل بيشوف شغل منافسينك جنب شغلك.',
      'الفيديو بيتقطّع ويفتح بمقاس غلط.',
      'لينك طويل من غير اسمك — بيقلل من قيمة سعرك.',
      'مفيش طريقة سريعة العميل يكلمك بيها.',
    ],
    compareNewTitle: 'بورتفوليو على ViralPX',
    compareNew: [
      'الصفحة كلها ليك — اسمك وشغلك وبس.',
      'الريلز بتشتغل 9:16 بسرعة على الموبايل.',
      'دومين باسمك — انطباع محترف من أول لحظة.',
      'زر واتساب ونموذج تواصل — العميل يكلمك في نفس اللحظة.',
    ],
    compareLink: 'جرّب الفرق مجانًا',
    pricingEyebrow: 'الأسعار',
    pricingTitle: 'جرّب شهر كامل مجانًا، وبعدها اختار اللي يريحك',
    pricingSub: 'كل الخطط فيها كل المميزات بالكامل — الفرق الوحيد هو طريقة الدفع.',
    plans: [
      { name: 'شهري', badge: '', price: '199', per: '/ شهريًا', note: 'مرونة كاملة من غير التزام طويل.', feats: ['ادفع شهر بشهر', 'الغي في أي وقت', 'كل المميزات'], cta: 'ابدأ شهرك المجاني', hi: false, color: '' },
      { name: 'سنوي', badge: 'الأوفر', price: '1,990', per: '/ سنويًا', note: 'يعني حوالي 166 في الشهر — وفّر شهرين', feats: ['شهرين مجانًا كل سنة', 'سعرك ثابت طول السنة', 'كل المميزات'], cta: 'ابدأ شهرك المجاني', hi: true, color: '' },
      { name: 'مرة واحدة', badge: 'مدى الحياة', price: '4,990', per: '/ مرة واحدة', note: 'ادفع مرة، وموقعك ليك على طول.', feats: ['من غير اشتراكات متجددة', 'كل التحديثات الجاية مشمولة', 'كل المميزات'], cta: 'ابدأ شهرك المجاني', hi: false, color: '' },
    ],
    // What every plan has, said once under the cards rather than repeated in
    // each of them — identical lists side by side read as padding.
    pricingIncludedTitle: 'في كل خطة:',
    pricingIncluded: [
      'دومين خاص + SSL',
      'تصميم قابل للتخصيص',
      'مشاريع وريلز 9:16',
      'مدونة مع SEO',
      'نموذج تواصل وزر واتساب',
      'عربي وإنجليزي',
      'دعم فني',
    ],
    pricingNote: 'أول 30 يوم مجانًا على أي خطة · من غير بطاقة دفع',
    testimonialsEyebrow: 'آراء',
    testimonialsTitle: 'من ناس جرّبوا قبلك',
    // The section stays off the page until the first real one is added.
    testimonials: [] as LandingTestimonial[],
    faqEyebrow: 'إجابات سريعة',
    faqTitle: 'قبل ما تبدأ',
    faqs: [
      { q: 'إيه اللي بيحصل بعد الشهر المجاني؟', a: 'قبل ما الشهر يخلص بنبعتلك تنبيه، وتختار الخطة اللي تناسبك. لو ماخترتش، موقعك بيتوقف مؤقتًا ومحتواك بيفضل محفوظ.' },
      { q: 'محتاج أدخل بطاقة دفع عشان أجرّب؟', a: 'لأ. سجّل وابدأ على طول — مش هتدفع حاجة غير لما تختار خطة.' },
      { q: 'إيه الفرق بين الخطط؟', a: 'المميزات واحدة في كل الخطط. الفرق بس في طريقة الدفع: شهري لو عايز مرونة، سنوي لو عايز توفّر، ومرة واحدة لو مش عايز اشتراكات خالص.' },
      { q: 'خطة المرة الواحدة بتشمل إيه بالظبط؟', a: 'الاستضافة وكل المميزات والتحديثات الجاية، من غير أي اشتراك. تجديد الدومين نفسه بيكون عليك سنويًا من الشركة اللي اشتريته منها.' },
      { q: 'أقدر أغيّر خطتي أو ألغي؟', a: 'أيوه، في أي وقت.' },
      { q: 'محتاج أعرف كود؟', a: 'خالص. كل حاجة من لوحة التحكم بالسحب والإفلات.' },
      { q: 'أقدر أربط دوميني؟', a: 'أيوه، والـSSL بيتفعّل تلقائي. ولو معندكش دومين، بنقولك تشتريه إزاي خطوة بخطوة.' },
      { q: 'الموقع بيدعم العربي والإنجليزي؟', a: 'أيوه، الموقع كامل باللغتين، والزائر يبدّل بينهم بضغطة.' },
      { q: 'بياناتي في أمان؟', a: 'الموقع شغال على HTTPS، وبياناتك بيتعملها نسخ احتياطي بشكل دوري.' },
    ],
    ctaTitle: 'شغلك جاهز. ناقصه بس موقع يليق بيه.',
    ctaSub: 'ابدأ شهرك المجاني النهارده — كل المميزات مفتوحة، ومن غير بطاقة دفع.',
    ctaBtn: 'ابدأ شهرك المجاني',
    footerNote: 'منصة بورتفوليو للمصممين وصنّاع المحتوى العرب.',
    // Columns, not one list. A single column of three links left the far half
    // of the row empty; groups fill it, and they are how a reader expects a
    // footer to be sorted. Add, rename, repoint or delete any of it from the
    // dashboard — a path starting with '#' jumps to a section of this page,
    // anything else is a full link.
    footerGroups: [
      {
        title: 'الموقع',
        links: [
          { label: 'المميزات', url: '#features' },
          { label: 'الأمثلة', url: '#showcase' },
          { label: 'الأسعار', url: '#pricing' },
        ],
      },
      {
        title: 'تعرف أكتر',
        links: [
          { label: 'ليه إحنا؟', url: '#compare' },
          { label: 'الأسئلة', url: '#faq' },
        ],
      },
    ],
    // Linked from the footer only once there is something written in them: a
    // policy link that opens an empty page is worse than no link.
    legalHeading: 'قانوني',
    legal: [
      { slug: 'privacy', title: 'سياسة الخصوصية', body: '' },
      { slug: 'terms', title: 'الشروط والأحكام', body: '' },
      { slug: 'refund', title: 'سياسة الاسترجاع', body: '' },
    ] as LandingLegalPage[],
    seoTitle: 'ViralPX — موقع بورتفوليو باسمك، وأول شهر مجانًا',
    seoDescription:
      'حوّل مشاريعك وريلزك ومقالاتك لموقع بورتفوليو احترافي على دومينك الخاص — بالعربي والإنجليزي، من غير كود. جرّبه شهر كامل مجانًا.',
    rights: 'كل الحقوق محفوظة',
  },
  en: {
    nav: { features: 'Features', how: 'How it works', showcase: 'Showcase', compare: 'Why us', pricing: 'Pricing', faq: 'FAQ' },
    cta: 'Start free',
    ctaUrl: '/login',
    login: 'Log in',
    tagline: 'SHOW. GROW. WIN.',
    heroEyebrow: 'Your first month is free',
    heroTitle: 'Your work deserves a site in your name,',
    heroTitleAccent: 'not a Drive link.',
    heroSub:
      'ViralPX turns your projects, reels and articles into a professional site on your own domain — in Arabic and English, without a line of code. Try it free for a full month, with every feature.',
    heroScale: 100,
    heroLeading: 100,
    heroTitleBreak: true,
    heroBtn1: 'Start your free month',
    heroBtn2: 'See a real portfolio',
    heroNote: 'No card needed · Every feature unlocked · Cancel anytime',
    panelEyebrow: 'See it for yourself',
    panelHeading: 'Edit it here, and it updates there.',
    panelSub: 'A short video showing how to build a complete portfolio from the dashboard — no code, no designer.',
    panelTitle: 'The dashboard and the site',
    panelVideo: '',
    panelPoster: '',
    panelDuration: '',
    panelBtn: 'Start your free month',
    panelNote: 'Everything you just watched — try it yourself, free for 30 days.',
    mock: {
      panel: 'Dashboard',
      items: ['Projects & reels', 'Highlights', 'Look & colours', 'Analytics'],
      circles: ['Reels', 'Testimonials', 'Services'],
      cards: ['Podcast edit', 'Motion ad', 'Brand identity'],
    },
    metricsLabels: { sites: 'portfolios published', projects: 'projects on show', visits: 'visits to the work' },
    featuresEyebrow: 'Features',
    featuresTitle: 'Everything that makes a client say “I want to work with them”',
    featuresSub: 'And you never pay extra for a feature — every plan has all of them.',
    features: [
      { icon: '🌐', iconUrl: '', bgUrl: '', t: 'Your own domain', d: 'yourname.com instead of a long link — with free, automatic SSL.' },
      { icon: '🎨', iconUrl: '', bgUrl: '', t: 'Design that fits you', d: 'Your colours, fonts and section order — all from the dashboard.' },
      { icon: '🖼️', iconUrl: '', bgUrl: '', t: 'Projects & reels', d: 'A 9:16 reel player, images and highlights — your work shown the way it deserves.' },
      { icon: '⚡', iconUrl: '', bgUrl: '', t: 'Fast, and found on Google', d: 'WebP images, a sitemap and structured data — a quick site that is easy to find.' },
      { icon: '✍️', iconUrl: '', bgUrl: '', t: 'A blog that builds trust', d: 'Write articles with SEO ready for each one — and let your expertise speak for you.' },
      { icon: '📩', iconUrl: '', bgUrl: '', t: 'Clients reach you instantly', d: 'A contact form that lands straight in your inbox, and a WhatsApp button on your site.' },
    ],
    audienceEyebrow: 'Who is it for?',
    audienceTitle: 'Made for anyone whose work needs to be seen',
    audience: ['Graphic designers', 'Video editors & reel makers', 'Photographers', 'UI/UX designers', 'Content writers', 'Freelancers'],
    howEyebrow: 'How it works',
    howTitle: 'Your site can be ready today',
    how: [
      { n: '1', iconUrl: '', t: 'Sign up free', d: 'Open the dashboard and start from a ready template — no card needed.' },
      { n: '2', iconUrl: '', t: 'Add your work', d: 'Upload your projects, reels and articles, and arrange the sections your way.' },
      { n: '3', iconUrl: '', t: 'Publish and get clients', d: 'Connect your domain, share your site, and clients contact you directly.' },
    ],
    howBtn: 'Take the first step',
    showcaseEyebrow: 'Live examples',
    showcaseTitle: 'Arab creators showing their work on ViralPX',
    showcaseSub: 'Open any portfolio and see the exact experience their clients get.',
    showcaseEmpty: 'Coming soon — the first portfolios are on the way.',
    visit: 'Visit the site',
    showcaseHidden: [] as string[],
    compareEyebrow: 'The difference',
    compareTitle: 'Clients judge you in the first 5 seconds',
    compareSub: 'A Drive link says you are still trying things out. A site in your name says you are a professional.',
    compareOldTitle: 'A Drive link or a shared platform',
    compareOld: [
      'The client sees your competitors’ work right next to yours.',
      'Video stutters and opens at the wrong size.',
      'A long link without your name — it undercuts your rate.',
      'No quick way for the client to reach you.',
    ],
    compareNewTitle: 'A portfolio on ViralPX',
    compareNew: [
      'The whole page is yours — your name, your work, nothing else.',
      'Reels play fast, in 9:16, on a phone.',
      'A domain in your name — professional from the first moment.',
      'A WhatsApp button and a contact form — the client reaches you on the spot.',
    ],
    compareLink: 'Try the difference free',
    pricingEyebrow: 'Pricing',
    pricingTitle: 'Try a full month free, then pick what suits you',
    pricingSub: 'Every plan includes every feature — the only difference is how you pay.',
    plans: [
      { name: 'Monthly', badge: '', price: '199', per: '/ month', note: 'Full flexibility, no long commitment.', feats: ['Pay month to month', 'Cancel anytime', 'Every feature'], cta: 'Start your free month', hi: false, color: '' },
      { name: 'Yearly', badge: 'Best value', price: '1,990', per: '/ year', note: 'About 166 a month — two months free', feats: ['Two months free every year', 'Your price stays fixed all year', 'Every feature'], cta: 'Start your free month', hi: true, color: '' },
      { name: 'One-time', badge: 'Lifetime', price: '4,990', per: '/ once', note: 'Pay once, and your site is yours for good.', feats: ['No recurring subscription', 'All future updates included', 'Every feature'], cta: 'Start your free month', hi: false, color: '' },
    ],
    pricingIncludedTitle: 'In every plan:',
    pricingIncluded: [
      'Custom domain + SSL',
      'Customisable design',
      'Projects & 9:16 reels',
      'Blog with SEO',
      'Contact form & WhatsApp button',
      'Arabic & English',
      'Support',
    ],
    pricingNote: 'First 30 days free on any plan · No card needed',
    testimonialsEyebrow: 'Reviews',
    testimonialsTitle: 'From people who tried it first',
    testimonials: [] as LandingTestimonial[],
    faqEyebrow: 'Quick answers',
    faqTitle: 'Before you start',
    faqs: [
      { q: 'What happens after the free month?', a: 'Before it ends we send you a reminder, and you pick the plan that suits you. If you don’t, your site pauses and your content stays saved.' },
      { q: 'Do I need a card to try it?', a: 'No. Sign up and start straight away — you pay nothing until you choose a plan.' },
      { q: 'What is the difference between the plans?', a: 'Every plan has the same features. Only the payment differs: monthly for flexibility, yearly to save, and one-time if you want no subscription at all.' },
      { q: 'What exactly does the one-time plan include?', a: 'Hosting, every feature and all future updates, with no subscription. Renewing the domain itself is yours to do, yearly, with the company you bought it from.' },
      { q: 'Can I change my plan or cancel?', a: 'Yes, at any time.' },
      { q: 'Do I need to know how to code?', a: 'Not at all. Everything is done from the dashboard, with drag and drop.' },
      { q: 'Can I connect my own domain?', a: 'Yes, and SSL switches on automatically. If you don’t have a domain yet, we walk you through buying one step by step.' },
      { q: 'Does the site support Arabic and English?', a: 'Yes — the whole site works in both, and visitors switch with one tap.' },
      { q: 'Is my data safe?', a: 'The site runs on HTTPS, and your data is backed up regularly.' },
    ],
    ctaTitle: 'Your work is ready. It just needs a site worthy of it.',
    ctaSub: 'Start your free month today — every feature unlocked, no card needed.',
    ctaBtn: 'Start your free month',
    footerNote: 'A portfolio platform for Arabic designers and creators.',
    footerGroups: [
      {
        title: 'The site',
        links: [
          { label: 'Features', url: '#features' },
          { label: 'Showcase', url: '#showcase' },
          { label: 'Pricing', url: '#pricing' },
        ],
      },
      {
        title: 'Learn more',
        links: [
          { label: 'Why us', url: '#compare' },
          { label: 'FAQ', url: '#faq' },
        ],
      },
    ],
    legalHeading: 'Legal',
    legal: [
      { slug: 'privacy', title: 'Privacy policy', body: '' },
      { slug: 'terms', title: 'Terms and conditions', body: '' },
      { slug: 'refund', title: 'Refund policy', body: '' },
    ] as LandingLegalPage[],
    seoTitle: 'ViralPX — A portfolio site in your name, first month free',
    seoDescription:
      'Turn your projects, reels and articles into a professional portfolio site on your own domain — Arabic and English, no code. Try it free for a month.',
    rights: 'All rights reserved',
  },
}

export type LandingCopy = (typeof LANDING_COPY)['ar']

/** The legal pages, in the order the footer lists them. */
export const LEGAL_SLUGS = ['privacy', 'terms', 'refund'] as const

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
    // The three pages are fixed; only their words are the owner's. Matched by
    // slug so a saved list from before a page existed still gets that page.
    legal: base.legal.map((p) => {
      const got = Array.isArray(s.legal) ? s.legal.find((x) => x?.slug === p.slug) : null
      return got ? { ...p, ...got } : p
    }),
  }
}
