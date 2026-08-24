/**
 * The brief to hand an AI (or a developer) before it writes a case-study page
 * to paste into a project.
 *
 * The point of it is the colour tokens. A page that hard-codes `#fff` and
 * `#111` is drawn once and stays that way; the site's dark/light switch then
 * either leaves it looking like a sheet of paper glued onto the page or, worse,
 * puts its dark text on the dark theme. Written against the tokens, the same
 * page repaints itself with the site — including a tenant's own palette, which
 * they edit in the Design tab.
 *
 * Anything the page defines for itself (class names, fonts, its own custom
 * properties) is namespaced on the way in, so it can't collide with the site.
 */
export const PASTE_GUIDE_AR = `اكتب صفحة HTML كاملة (مع <style> جوّاها) عشان ألصقها في صفحة مشروع.

مهم جدًا — الألوان:
لا تستخدم ألوانًا ثابتة للخلفيات والنصوص (#fff / #000 / rgb...). استخدم متغيّرات الموقع عشان التصميم يتغيّر مع الوضع الليلي والنهاري ومع ألوان صاحب الموقع:
  var(--bg)      خلفية الصفحة
  var(--bg-2)    خلفية الكروت والصناديق
  var(--bg-3)    خلفية أغمق/أفتح شوية للتمييز
  var(--text)    لون النص الأساسي
  var(--sub)     لون النص الثانوي
  var(--border)  لون الحدود
  var(--accent)  لون الهوية (الأزرار، العناوين المميّزة، الأيقونات)
  var(--radius-card) و var(--radius-pill) لنصف قطر الزوايا

ابدأ بـ:
  body { background: var(--bg); color: var(--text); margin: 0; }

للكروت:
  background: var(--bg-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);

لو محتاج لونًا مشتقًا (أفتح/أغمق/شفاف) استخدم:
  color-mix(in srgb, var(--accent) 15%, transparent)

ممنوع:
- <script> (مش هيشتغل).
- position: fixed أو أقسام بارتفاع 100vh — الصفحة بتتعرض جوّه المشروع مش لوحدها.
- عرض أكبر من 1100px؛ خلّي الحاوية max-width: 1100px; margin: 0 auto;

مسموح:
- أسماء الكلاسات زي ما تحب (بتتعزل تلقائيًا).
- خطوط عبر @import من Google Fonts.
- الاتجاه: اكتب dir="rtl" للعربي.`

export const PASTE_GUIDE_EN = `Write a complete HTML page (with its <style> inside) to paste into a project page.

Most important — colours:
Don't hard-code background and text colours (#fff / #000 / rgb...). Use the site's variables so the design follows dark/light mode and the site owner's palette:
  var(--bg)      page background
  var(--bg-2)    card and panel background
  var(--bg-3)    a slightly deeper/lighter surface
  var(--text)    primary text
  var(--sub)     secondary text
  var(--border)  borders
  var(--accent)  brand colour (buttons, highlights, icons)
  var(--radius-card) and var(--radius-pill) for corner radii

Start with:
  body { background: var(--bg); color: var(--text); margin: 0; }

For cards:
  background: var(--bg-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);

For a derived colour (lighter/darker/translucent) use:
  color-mix(in srgb, var(--accent) 15%, transparent)

Not allowed:
- <script> (it won't run).
- position: fixed, or sections sized to 100vh — the page renders inside a project, not on its own.
- Widths over 1100px; keep the container at max-width: 1100px; margin: 0 auto;

Fine to use:
- Any class names you like (they're namespaced automatically).
- Fonts via @import from Google Fonts.
- Direction: use dir="rtl" for Arabic.`
