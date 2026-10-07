import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/*
 * The landing page's new copy (2026-10-08), written by a content writer from
 * the feature brief, with an English version written for English readers
 * rather than translated word for word.
 *
 * Unlike the earlier copy migrations this one replaces the text whatever it
 * says now: the owner asked for this copy, in full, in place of what is there.
 * What it leaves alone is everything that is not words — pictures, videos,
 * links, colours, prices and the order of the sections — and the page parts
 * the new copy does not cover (the drawn dashboard, legal pages, reviews).
 *
 * The Arabic moves from Egyptian to Modern Standard Arabic, so the small
 * labels the writer did not cover (menu, eyebrows, footer links) move with it
 * rather than switching voice mid-page.
 */

type Obj = Record<string, unknown>
type Row = { id: number; _locale: string; content: unknown }
type Lang = 'ar' | 'en'
type TD = { t: string; d: string }
type QA = { q: string; a: string }

type Copy = {
  scalars: Obj
  nav: Obj
  compareOld: string[]
  compareNew: string[]
  dash: TD[]
  features: (TD & { icon: string })[]
  audience: string[]
  how: TD[]
  plans: { name: string; badge: string; per: string; note: string; cta: string }[]
  faqs: QA[]
  footerLinks: Record<string, string>
  footerTitles: Record<string, string>
  footerDefault: { title: string; links: { label: string; url: string }[] }[]
}

const TRIAL_AR = 'اطلب تجربتك المجانية'
const TRIAL_EN = 'Request your free trial'

const COPY: Record<Lang, Copy> = {
  ar: {
    scalars: {
      cta: 'ابدأ مجانًا',
      login: 'دخول',
      heroEyebrow: '',
      heroTitle: 'موقع يليق',
      heroTitleAccent: 'بأعمالك',
      heroSub:
        'اجمع مشاريعك وصورك وفيديوهاتك في موقع بورتفوليو باسمك. تحكّم في محتواه وتصميمه بنفسك، واجعل التواصل معك أسهل.',
      heroBtn1: TRIAL_AR,
      heroBtn2: 'شاهد نموذجًا',
      heroNote: '30 يومًا مجانًا · دون بطاقة دفع · تواصل معنا عبر واتساب',

      compareEyebrow: 'المقارنة',
      compareTitle: 'رابط واحد يمثّلك',
      compareSub: 'امنح العميل صورة متكاملة عن أعمالك وخبراتك، في موقع واحد يسهل تصفّحه ومشاركته.',
      compareOldTitle: 'أعمال موزّعة بين الروابط',
      compareNewTitle: 'موقعك على ViralPX',
      compareLink: '',

      panelEyebrow: 'جولة سريعة',
      panelHeading: 'اكتشف لوحة التحكم',
      panelSub: 'شاهد كيف تضيف أعمالك وتخصّص موقعك بخطوات واضحة، دون برمجة.',
      panelBtn: 'شاهد الجولة',
      panelBtnUrl: '',
      panelNote: '',

      dashEyebrow: 'لوحة التحكم',
      dashTitle: 'عدّل موقعك بنفسك',
      dashSub: 'حدّث محتواك، واختر مظهر موقعك، وشاهد التغييرات قبل الحفظ.',

      featuresEyebrow: 'المميزات',
      featuresTitle: 'لماذا ViralPX؟',
      featuresSub: 'تفاصيل تساعدك على عرض أعمالك بوضوح، وفهم اهتمام جمهورك، وتسهيل التواصل معك.',

      audienceEyebrow: 'لمن؟',
      audienceTitle: 'مصمّم للمبدعين',
      audienceSub: 'مساحة تعرض فيها أعمالك، مهما اختلف تخصصك.',

      howEyebrow: 'كيف تبدأ',
      howTitle: 'ابدأ بثلاث خطوات',
      howBtn: TRIAL_AR,

      showcaseEyebrow: 'نماذج حية',
      showcaseTitle: 'شاهد مواقع حقيقية',
      showcaseSub: 'تصفّح مواقع مبنية على ViralPX، واكتشف كيف يعرض المبدعون أعمالهم.',
      showcaseEmpty: 'قريبًا — أولى المواقع في الطريق.',
      visit: 'شاهد الموقع',

      pricingEyebrow: 'الأسعار',
      pricingTitle: 'الشهر الأول علينا',
      pricingSub: 'جرّب جميع المميزات لمدة 30 يومًا مجانًا، ثم اختر طريقة الاشتراك المناسبة لك.',
      pricingIncludedTitle: 'جميع الخطط تشمل المميزات نفسها.',
      pricingIncluded: [],
      pricingNote:
        'شراء الدومين الخاص وتجديده منفصلان عن الاشتراك.\nدون بطاقة دفع · الاشتراك والدفع بالتنسيق مع الفريق عبر واتساب',

      testimonialsTitle: 'من مبدعين جرّبوا قبلك',

      faqEyebrow: 'الأسئلة الشائعة',
      faqTitle: 'قبل أن تبدأ',

      ctaTitle: 'أعمالك جاهزة',
      ctaSub: 'امنحها موقعًا يليق بها، وشاركها بثقة.',
      ctaBtn: TRIAL_AR,

      footerNote:
        'ViralPX منصة لإنشاء مواقع بورتفوليو للمبدعين. اعرض أعمالك باسمك، وخصّص موقعك بنفسك، وسهّل التواصل معك.',
      rights: 'جميع الحقوق محفوظة',

      seoTitle: 'ViralPX — موقع بورتفوليو يليق بأعمالك',
      seoDescription:
        'اجمع مشاريعك وصورك وفيديوهاتك في موقع بورتفوليو باسمك، وتحكّم في محتواه وتصميمه بنفسك. جرّبه 30 يومًا مجانًا.',
    },
    nav: { features: 'المميزات', how: 'الخطوات', showcase: 'نماذج', compare: 'لماذا نحن؟', pricing: 'الأسعار', faq: 'الأسئلة' },
    compareOld: [
      'روابط منفصلة للصور والفيديوهات',
      'نبذتك وخبراتك منفصلة عن مشاريعك',
      'شكل مختلف في كل منصة',
    ],
    compareNew: [
      'أعمالك بأنواعها في موقع واحد',
      'أعمالك وخبراتك ووسائل التواصل معًا',
      'ألوان وخطوط وترتيب تختارها بنفسك',
    ],
    dash: [
      { t: 'مشاريعك ومحتواك', d: 'أضف أعمالك، وعدّل النصوص، ورتّب المشاريع بالطريقة التي تناسبك.' },
      { t: 'ألوانك وخطوطك', d: 'اختر الألوان والخطوط والصور التي تعبّر عن هويتك.' },
      { t: 'أقسامك وترتيبها', d: 'رتّب الأقسام بالسحب والإفلات، وأخفِ ما لا تحتاج إليه.' },
      { t: 'مدونتك الخاصة', d: 'انشر مقالاتك وشارك خبراتك داخل موقعك.' },
    ],
    features: [
      { icon: 'reel', t: 'مشاريع وريلز', d: 'اعرض الصور والفيديوهات وصفحات المشاريع، مع ريلز عمودية تظهر بمقاسها دون قص.' },
      { icon: 'globe', t: 'عربي وإنجليزي', d: 'اكتب محتواك باللغتين، ودع الزائر يختار لغته. ولوحة التحكم متاحة باللغتين أيضًا.' },
      { icon: 'browser', t: 'استيراد من Behance', d: 'انقل مشاريعك إلى موقعك دون إعادة رفعها من البداية.' },
      { icon: 'chat', t: 'تواصل مباشر', d: 'واتساب واتصال ونموذج تواصل، ليختار العميل الطريقة المناسبة للوصول إليك.' },
      { icon: 'chart', t: 'إحصائيات واضحة', d: 'تعرّف على مصادر الزيارات، وتابع أكثر مشاريعك مشاهدة.' },
      { icon: 'star', t: 'آراء تعزّز الثقة', d: 'أرسل لعميلك رابطًا لكتابة رأيه، وراجعه قبل نشره على موقعك.' },
    ],
    audience: ['مصممو الجرافيك', 'المصورون', 'محررو الفيديو', 'مصممو الموشن', 'مصممو UI/UX', 'كتّاب المحتوى'],
    how: [
      { t: 'اطلب تجربتك', d: 'تواصل معنا عبر واتساب. نجهّز حسابك ونرسل إليك رابطًا عبر البريد الإلكتروني لاختيار كلمة المرور.' },
      { t: 'أضف أعمالك', d: 'ارفع مشاريعك أو استوردها من Behance، ثم خصّص مظهر موقعك.' },
      { t: 'شارك موقعك', d: 'أرسل رابطك للعملاء، واجمع أعمالك وخبراتك ووسائل التواصل في مكان واحد.' },
    ],
    plans: [
      { name: 'شهري', badge: '', per: '/ شهر', note: 'مرونة في الاشتراك والإلغاء', cta: TRIAL_AR },
      { name: 'سنوي', badge: 'الأوفر', per: '/ سنة', note: 'وفّر 25% مقارنة بالدفع الشهري', cta: TRIAL_AR },
      { name: 'دفعة واحدة', badge: '', per: '', note: 'استضافة ومميزات وتحديثات دون اشتراك متكرر', cta: TRIAL_AR },
    ],
    faqs: [
      { q: 'هل أحتاج إلى معرفة البرمجة؟', a: 'لا. يمكنك تعديل المحتوى والتصميم من لوحة التحكم، وترتيب المشاريع والأقسام بالسحب والإفلات.' },
      { q: 'كيف أبدأ التجربة المجانية؟', a: 'تواصل معنا عبر واتساب. نجهّز حسابك ونرسل إليك رسالة بريد إلكتروني لاختيار كلمة المرور والبدء.' },
      { q: 'ماذا يحدث بعد انتهاء التجربة؟', a: 'إذا رغبت في الاستمرار، تختار خطتك وتنسّق الدفع مع الفريق. لا نطلب بطاقة دفع للتجربة، ولا يوجد خصم تلقائي.' },
      { q: 'هل أحتاج إلى شراء دومين؟', a: 'لا. يمكنك استخدام رابط باسمك داخل viralpx.com، أو ربط دومين خاص تملكه. شراء الدومين وتجديده مسؤوليتك، حتى مع خطة الدفعة الواحدة.' },
      { q: 'هل يمكنني نقل مشاريعي من Behance؟', a: 'نعم. يمكنك استيراد مشاريعك إلى موقعك بدلًا من إعادة رفعها من البداية.' },
      { q: 'هل يدعم الموقع العربية والإنجليزية؟', a: 'نعم. الموقع ولوحة التحكم متاحان باللغتين، ويمكنك كتابة محتواك بالعربية والإنجليزية ليختار الزائر اللغة المناسبة.' },
      { q: 'هل الموقع مناسب للهاتف؟', a: 'نعم. يتكيّف الموقع مع شاشة الهاتف، مع عرض مناسب للريلز وأزرار تسهّل الوصول إلى وسائل التواصل.' },
      { q: 'هل يساعد الموقع على الظهور في البحث؟', a: 'يتضمن الموقع أدوات لتهيئة الصفحات لمحركات البحث، مثل العناوين والأوصاف وخريطة الموقع. الظهور والترتيب يعتمدان على عوامل متعددة، ولا يمكن ضمانهما.' },
      { q: 'ماذا يحدث إذا ألغيت الاشتراك؟', a: 'يتوقف الموقع مؤقتًا، ويظل المحتوى محفوظًا لاستعادته عند العودة.' },
    ],
    footerLinks: {
      '#features': 'المميزات',
      '#showcase': 'النماذج',
      '#pricing': 'الأسعار',
      '#compare': 'لماذا ViralPX؟',
      '#faq': 'الأسئلة الشائعة',
      '#how': 'الخطوات',
    },
    footerTitles: { 'تعرف أكتر': 'اعرف أكثر' },
    footerDefault: [
      {
        title: 'الموقع',
        links: [
          { label: 'المميزات', url: '#features' },
          { label: 'النماذج', url: '#showcase' },
          { label: 'الأسعار', url: '#pricing' },
        ],
      },
      {
        title: 'اعرف أكثر',
        links: [
          { label: 'لماذا ViralPX؟', url: '#compare' },
          { label: 'الأسئلة الشائعة', url: '#faq' },
        ],
      },
    ],
  },

  en: {
    scalars: {
      cta: 'Try it free',
      login: 'Log in',
      heroEyebrow: '',
      heroTitle: 'A site that does',
      heroTitleAccent: 'your work justice',
      heroSub:
        'Bring your projects, photos and videos together in a portfolio site under your own name. You control its content and design, and clients can reach you more easily.',
      heroBtn1: TRIAL_EN,
      heroBtn2: 'See an example',
      heroNote: '30 days free · No card needed · Get in touch on WhatsApp',

      compareEyebrow: 'Compare',
      compareTitle: 'One link that represents you',
      compareSub: 'Give clients the full picture of your work and experience, on one site that is easy to browse and share.',
      compareOldTitle: 'Work scattered across links',
      compareNewTitle: 'Your site on ViralPX',
      compareLink: '',

      panelEyebrow: 'Quick tour',
      panelHeading: 'Discover the dashboard',
      panelSub: 'See how you add your work and customise your site in a few clear steps, with no coding.',
      panelBtn: 'Watch the tour',
      panelBtnUrl: '',
      panelNote: '',

      dashEyebrow: 'Dashboard',
      dashTitle: 'Edit your site yourself',
      dashSub: 'Update your content, choose how your site looks, and preview every change before you save.',

      featuresEyebrow: 'Features',
      featuresTitle: 'Why ViralPX?',
      featuresSub: 'The details that help you present your work clearly, see what your audience cares about, and make you easy to reach.',

      audienceEyebrow: 'Who it’s for',
      audienceTitle: 'Made for creatives',
      audienceSub: 'A place to show your work, whatever your specialty.',

      howEyebrow: 'How it works',
      howTitle: 'Get started in three steps',
      howBtn: TRIAL_EN,

      showcaseEyebrow: 'Live examples',
      showcaseTitle: 'See real sites',
      showcaseSub: 'Browse sites built on ViralPX and see how creatives present their work.',
      showcaseEmpty: 'Coming soon — the first sites are on their way.',
      visit: 'Visit the site',

      pricingEyebrow: 'Pricing',
      pricingTitle: 'Your first month is on us',
      pricingSub: 'Try every feature free for 30 days, then choose the plan that suits you.',
      pricingIncludedTitle: 'Every plan includes the same features.',
      pricingIncluded: [],
      pricingNote:
        'Buying and renewing your own domain is separate from the subscription.\nNo card needed · Subscription and payment arranged with our team on WhatsApp',

      testimonialsTitle: 'From creatives who tried it first',

      faqEyebrow: 'FAQ',
      faqTitle: 'Before you start',

      ctaTitle: 'Your work is ready',
      ctaSub: 'Give it a site that does it justice, and share it with confidence.',
      ctaBtn: TRIAL_EN,

      footerNote:
        'ViralPX is a platform for building portfolio sites for creatives. Show your work under your own name, customise your site yourself, and make it easy for clients to reach you.',
      rights: 'All rights reserved',

      seoTitle: 'ViralPX — A portfolio site that does your work justice',
      seoDescription:
        'Bring your projects, photos and videos together in a portfolio site under your own name, and manage it yourself. Try it free for 30 days.',
    },
    nav: { features: 'Features', how: 'How it works', showcase: 'Examples', compare: 'Why us', pricing: 'Pricing', faq: 'FAQ' },
    compareOld: [
      'Separate links for photos and videos',
      'Your bio and experience kept apart from your projects',
      'A different look on every platform',
    ],
    compareNew: [
      'All your work, of every kind, on one site',
      'Your work, experience and contact details together',
      'Colours, fonts and layout you choose yourself',
    ],
    dash: [
      { t: 'Your projects and content', d: 'Add your work, edit your text, and order your projects the way that suits you.' },
      { t: 'Your colours and fonts', d: 'Choose the colours, fonts and images that express who you are.' },
      { t: 'Your sections, your order', d: 'Drag sections into order and hide the ones you don’t need.' },
      { t: 'Your own blog', d: 'Publish articles and share your expertise on your own site.' },
    ],
    features: [
      { icon: 'reel', t: 'Projects and reels', d: 'Show photos, videos and project pages, with vertical reels at their true size, never cropped.' },
      { icon: 'globe', t: 'Arabic and English', d: 'Write your content in both languages and let visitors pick theirs. The dashboard works in both, too.' },
      { icon: 'browser', t: 'Import from Behance', d: 'Bring your projects over to your site without uploading them all again.' },
      { icon: 'chat', t: 'Direct contact', d: 'WhatsApp, a call button and a contact form, so every client can reach you the way they prefer.' },
      { icon: 'chart', t: 'Clear analytics', d: 'See where your visitors come from and which projects get the most views.' },
      { icon: 'star', t: 'Reviews that build trust', d: 'Send a client a link to write a review, and approve it before it appears on your site.' },
    ],
    audience: ['Graphic designers', 'Photographers', 'Video editors', 'Motion designers', 'UI/UX designers', 'Content writers'],
    how: [
      { t: 'Request your trial', d: 'Message us on WhatsApp. We set up your account and email you a link to choose your password.' },
      { t: 'Add your work', d: 'Upload your projects or import them from Behance, then customise how your site looks.' },
      { t: 'Share your site', d: 'Send your link to clients, with your work, experience and contact details in one place.' },
    ],
    plans: [
      { name: 'Monthly', badge: '', per: '/ month', note: 'Subscribe and cancel whenever you like', cta: TRIAL_EN },
      { name: 'Yearly', badge: 'Best value', per: '/ year', note: 'Save 25% compared with paying monthly', cta: TRIAL_EN },
      { name: 'One-time', badge: '', per: '', note: 'Hosting, features and updates with no recurring subscription', cta: TRIAL_EN },
    ],
    faqs: [
      { q: 'Do I need to know how to code?', a: 'No. You edit your content and design from the dashboard, and drag to reorder your projects and sections.' },
      { q: 'How do I start the free trial?', a: 'Message us on WhatsApp. We set up your account and email you a link to choose your password and get started.' },
      { q: 'What happens when the trial ends?', a: 'If you’d like to continue, you choose a plan and arrange payment with our team. We don’t ask for a card for the trial, and nothing is ever charged automatically.' },
      { q: 'Do I need to buy a domain?', a: 'No. You can use an address with your name on viralpx.com, or connect a domain you own. Buying and renewing a domain is up to you, including on the one-time plan.' },
      { q: 'Can I bring my projects over from Behance?', a: 'Yes. You can import your projects into your site instead of uploading them again.' },
      { q: 'Does the site support Arabic and English?', a: 'Yes. Both the site and the dashboard work in either language, and you can write your content in Arabic and English so visitors read it in theirs.' },
      { q: 'Does the site work well on phones?', a: 'Yes. It adapts to phone screens, shows reels properly, and keeps your contact buttons within easy reach.' },
      { q: 'Will the site help me show up in search?', a: 'It includes tools that prepare your pages for search engines, such as titles, descriptions and a sitemap. Visibility and ranking depend on many factors, so they can’t be guaranteed.' },
      { q: 'What happens if I cancel?', a: 'Your site pauses, and your content stays saved so you can pick up where you left off when you come back.' },
    ],
    footerLinks: {
      '#features': 'Features',
      '#showcase': 'Examples',
      '#pricing': 'Pricing',
      '#compare': 'Why ViralPX',
      '#faq': 'FAQ',
      '#how': 'How it works',
    },
    footerTitles: {},
    footerDefault: [
      {
        title: 'The site',
        links: [
          { label: 'Features', url: '#features' },
          { label: 'Examples', url: '#showcase' },
          { label: 'Pricing', url: '#pricing' },
        ],
      },
      {
        title: 'Learn more',
        links: [
          { label: 'Why ViralPX', url: '#compare' },
          { label: 'FAQ', url: '#faq' },
        ],
      },
    ],
  },
}

/** Write each text into the item at the same place, keeping everything else on it. */
function overlay<T extends Obj>(current: unknown, next: T[]): Obj[] {
  const old = Array.isArray(current) ? (current as Obj[]) : []
  return next.map((n, i) => ({ ...(old[i] ?? {}), ...n }))
}

function rewrite(content: Obj, lang: Lang): Obj {
  const c = COPY[lang]
  const out: Obj = { ...content, ...c.scalars }

  out.nav = { ...((content.nav as Obj) ?? {}), ...c.nav }
  out.compareOld = c.compareOld
  out.compareNew = c.compareNew
  out.audience = c.audience
  out.faqs = c.faqs

  out.dash = overlay(content.dash, c.dash).map((d) => ({ imageUrl: '', videoUrl: '', poster: '', ...d }))
  // The built-in icon takes over from an uploaded one, so the six match.
  out.features = overlay(
    content.features,
    c.features.map((f) => ({ ...f, iconUrl: '' })),
  ).map((f) => ({ iconTint: true, bgUrl: '', ...f }))
  out.how = overlay(content.how, c.how).map((s, i) => ({ iconUrl: '', ...s, n: String(i + 1) }))
  // Prices, colours and destinations stay as they are; only the words change.
  // With no plans saved the page shows its own, and a plan cannot be made up
  // here without a price.
  if (Array.isArray(content.plans)) {
    out.plans = (content.plans as Obj[]).map((p, i) => (c.plans[i] ? { ...p, ...c.plans[i], feats: [] } : p))
  }

  if (!Array.isArray(content.footerGroups)) {
    // Never saved: the page was showing its built-in columns, in the old voice.
    out.footerGroups = c.footerDefault
  } else {
    out.footerGroups = (content.footerGroups as Obj[]).map((g) => ({
      ...g,
      title: c.footerTitles[String(g.title)] ?? g.title,
      links: Array.isArray(g.links)
        ? (g.links as Obj[]).map((l) => ({ ...l, label: c.footerLinks[String(l.url)] ?? l.label }))
        : g.links,
    }))
  }

  return out
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const res = (await db.execute(
    sql`SELECT "id", "_locale", "content" FROM "landing_locales" WHERE "content" IS NOT NULL`,
  )) as unknown as { rows?: Row[] } | Row[]
  const rows = Array.isArray(res) ? res : (res.rows ?? [])

  for (const row of rows) {
    const lang: Lang = row._locale === 'en' ? 'en' : 'ar'
    const content = (typeof row.content === 'string' ? JSON.parse(row.content) : row.content) as Obj
    const next = rewrite(content, lang)
    await db.execute(sql`
      UPDATE "landing_locales" SET "content" = ${JSON.stringify(next)}::jsonb WHERE "id" = ${row.id};`)
  }
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // Copy, not structure: the owner edits it from the dashboard either way.
}
