import type { Payload } from 'payload'
import type { ContentForm, ExpertiseItem, Loc } from './content-types'
import { writeContent } from './content-write'
import type { StarterField } from './starter-fields'

/**
 * What a new portfolio starts with, instead of nothing.
 *
 * An empty dashboard gives a new client no idea what goes where; a page of
 * finished sections in their own name shows them, and each one is theirs to
 * rewrite. What is written here is only what a stranger could honestly say
 * about someone in that line of work — what they do, how, and with what.
 * Nothing that would be a claim: no reviews, no client logos, no numbers, no
 * employers, no projects. The portfolio is public from the moment it exists,
 * and an invented testimonial under a real person's name is worse than an
 * empty section, which the page simply leaves out.
 */

const L = (ar: string, en: string): Loc => ({ ar, en })

const service = (title: Loc, description: Loc): ExpertiseItem => ({
  title,
  description,
  iconId: null,
  iconUrl: null,
  imageId: null,
  imageUrl: null,
  bgZoom: 100,
  bgOverlay: 60,
  bgOverlayLight: 85,
  bgPosX: 50,
  bgPosY: 50,
})

type Voice = {
  title: Loc
  desc: Loc
  about: Loc
  tags: Loc
  services: [Loc, Loc][]
  skills: Loc
  tools: string[]
  projectsSub: Loc
}

const VOICES: Record<StarterField, Voice> = {
  designer: {
    title: L('مصمم جرافيك وهوية بصرية', 'Graphic & brand identity designer'),
    desc: L(
      'بصمّم هويات بصرية وتصميمات سوشيال ميديا بتخلّي البراند يتعرف من أول نظرة.',
      'I design brand identities and social media visuals that make a brand recognisable at a glance.',
    ),
    about: L(
      'بشتغل مع الشركات والمشاريع الصغيرة عشان أحوّل فكرتهم لشكل واضح ومتناسق في كل مكان بيظهروا فيه — من اللوجو لحد البوست.',
      'I work with companies and small businesses to turn their idea into a clear, consistent look everywhere they appear — from the logo to the post.',
    ),
    tags: L('هوية بصرية, سوشيال ميديا, لوجوهات, مطبوعات', 'Brand identity, Social media, Logos, Print'),
    services: [
      [L('الهوية البصرية', 'Brand identity'), L('لوجو، ألوان، خطوط، ودليل استخدام يجمعهم.', 'A logo, colours, type, and a guide that holds them together.')],
      [L('تصميمات السوشيال ميديا', 'Social media design'), L('بوستات وستوريز بشكل ثابت يخلّي الصفحة متناسقة.', 'Posts and stories in a steady style that keeps the feed consistent.')],
      [L('المطبوعات', 'Print'), L('كروت، بروشورات، وتغليف جاهز للطباعة.', 'Cards, brochures and packaging, ready for print.')],
    ],
    skills: L('الإبداع, الالتزام بالمواعيد, التواصل, فهم البراند', 'Creativity, Meeting deadlines, Communication, Brand thinking'),
    tools: ['Photoshop', 'Illustrator', 'InDesign', 'Figma'],
    projectsSub: L('مختارات من شغلي في الهويات والسوشيال ميديا', 'A selection of identity and social media work'),
  },
  video: {
    title: L('مونتير وصانع محتوى', 'Video editor & content creator'),
    desc: L(
      'بعمل مونتاج ريلز وفيديوهات بتشد الانتباه من أول ثانية وتوصّل الرسالة.',
      'I edit reels and videos that hold attention from the first second and get the message across.',
    ),
    about: L(
      'بشتغل على الفيديو من الفكرة للنسخة النهائية — قص، إيقاع، صوت، وألوان — عشان المحتوى يتشاف ويتفهم ويتشارك.',
      'I take video from the idea to the final cut — pacing, sound and colour — so the content gets watched, understood and shared.',
    ),
    tags: L('ريلز, مونتاج, موشن جرافيك, تلوين', 'Reels, Editing, Motion graphics, Colour grading'),
    services: [
      [L('مونتاج الريلز', 'Reels editing'), L('فيديوهات قصيرة بإيقاع سريع وترجمة واضحة.', 'Short, fast-paced videos with clear captions.')],
      [L('فيديوهات الإعلانات', 'Ad videos'), L('فيديو بيعرض المنتج ويقول للمشاهد يعمل إيه.', 'A video that shows the product and tells the viewer what to do next.')],
      [L('الموشن جرافيك', 'Motion graphics'), L('نصوص وعناصر متحركة بتوضّح الفكرة.', 'Moving type and graphics that make the idea clear.')],
    ],
    skills: L('سرد القصة, الإيقاع, السرعة في التسليم, التواصل', 'Storytelling, Pacing, Fast turnaround, Communication'),
    tools: ['Premiere Pro', 'After Effects', 'DaVinci Resolve', 'CapCut'],
    projectsSub: L('مختارات من الريلز والفيديوهات اللي عملتها', 'A selection of reels and videos'),
  },
  photo: {
    title: L('مصوّر', 'Photographer'),
    desc: L(
      'بصوّر المنتجات والأشخاص والمناسبات بصورة بتحكي القصة وبتفضل في الذاكرة.',
      'I photograph products, people and events in pictures that tell the story and stay with you.',
    ),
    about: L(
      'بهتم بالإضاءة والتفاصيل عشان كل صورة تبان طبيعية ومتقنة في نفس الوقت، وبسلّم الصور متعدّلة وجاهزة للنشر.',
      'I care about light and detail so every picture looks natural and polished at once, and I deliver them edited and ready to publish.',
    ),
    tags: L('تصوير منتجات, بورتريه, مناسبات, تعديل صور', 'Product, Portrait, Events, Retouching'),
    services: [
      [L('تصوير المنتجات', 'Product photography'), L('صور نضيفة للمتاجر والإعلانات.', 'Clean pictures for shops and ads.')],
      [L('البورتريه', 'Portraits'), L('صور شخصية للأفراد وفرق العمل.', 'Portraits for individuals and teams.')],
      [L('المناسبات', 'Events'), L('تغطية كاملة للحفلات والمؤتمرات.', 'Full coverage of parties and conferences.')],
    ],
    skills: L('الإضاءة, التكوين, التعامل مع الناس, الدقة', 'Lighting, Composition, Working with people, Attention to detail'),
    tools: ['Lightroom', 'Photoshop', 'Capture One'],
    projectsSub: L('مختارات من الصور اللي صوّرتها', 'A selection of my photographs'),
  },
  general: {
    title: L('فريلانسر مبدع', 'Creative freelancer'),
    desc: L(
      'بساعد الأفراد والشركات يطلّعوا أفكارهم بشكل احترافي يوصل للناس.',
      'I help people and companies bring their ideas out in a professional way that reaches people.',
    ),
    about: L(
      'بشتغل بشكل مستقل مع عملاء من مجالات مختلفة، وبهتم أفهم الهدف كويس قبل ما أبدأ، وأسلّم في الميعاد.',
      'I work independently with clients across fields, take the time to understand the goal before I start, and deliver on time.',
    ),
    tags: L('إبداع, جودة, التزام', 'Creativity, Quality, Reliability'),
    services: [
      [L('فهم الفكرة', 'Understanding the brief'), L('بفهم هدفك كويس الأول وبحط خطة واضحة للشغل.', 'I get the goal right first and set a clear plan for the work.')],
      [L('التنفيذ', 'Doing the work'), L('شغل متقن بيتسلّم في الميعاد المتفق عليه.', 'Careful work, delivered when we agreed.')],
      [L('المتابعة', 'Follow-up'), L('تعديلات ودعم بعد التسليم لحد ما تبقى راضي.', 'Revisions and support after delivery until you are happy.')],
    ],
    skills: L('التواصل, تنظيم الوقت, حل المشكلات', 'Communication, Time management, Problem solving'),
    tools: [],
    projectsSub: L('مختارات من شغلي', 'A selection of my work'),
  },
}

/** The texts a new portfolio in this line of work starts with. */
export function starterContent(field: StarterField, name: string): ContentForm {
  const v = VOICES[field]
  return {
    hero: { name: L(name, name), title: v.title, desc: v.desc, btn1: L('شوف شغلي', 'See my work'), btn2: L('تواصل معايا', 'Get in touch') },
    about: { title: L('عنّي', 'About me'), text: v.about, tags: v.tags },
    expertise: { title: L('خدماتي', 'What I do'), items: v.services.map(([t, d]) => service(t, d)) },
    // Left empty: an employer or a degree is a fact about a person, not a
    // starting point. The page leaves both sections out until they are filled.
    experience: { title: L('الخبرات', 'Experience'), items: [] },
    education: { title: L('التعليم', 'Education'), items: [] },
    skills: { title: L('المهارات', 'Skills'), items: v.skills },
    tools: { title: L('الأدوات', 'Tools'), items: v.tools.map((name) => ({ name, iconId: null, iconUrl: null })) },
    projects: { title: L('أعمالي', 'My work'), subtitle: v.projectsSub },
    clients: { title: L('عملاء اشتغلت معاهم', 'Clients') },
    testimonials: { title: L('آراء العملاء', 'What clients say') },
    contact: {
      title: L('يلا نشتغل سوا', "Let's work together"),
      subtitle: L('ابعتلي تفاصيل مشروعك وهرد عليك في أقرب وقت.', "Tell me about your project and I'll get back to you soon."),
      email: '',
      phone: '',
    },
  }
}

/**
 * Give a new portfolio its starting texts. The settings document is created
 * here if it does not exist yet — a brand-new tenant has none.
 */
export async function seedStarter(payload: Payload, tenantId: number, field: StarterField, name: string) {
  const found = await payload.find({ collection: 'site-settings', where: { tenant: { equals: tenantId } }, limit: 1, depth: 0 })
  const settings =
    found.docs[0] ?? (await payload.create({ collection: 'site-settings', data: { tenant: tenantId } }))
  // The public contact address stays empty — the form delivers to the
  // client's login address without printing it on the page.
  await writeContent(payload, settings.id, starterContent(field, name))
}
