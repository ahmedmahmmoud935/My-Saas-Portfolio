# Approved landing implementation — 22 November 2026

Implemented as React components in the existing App Router page. No server, Next build, database access, migration, dependency installation, or commit was performed. The pre-existing change in `.claude/launch.json` was left untouched.

## Saved content and defaults

**Production saved values were unavailable: this environment has no database.** The tables below exhaustively compare the previous code defaults with the approved new defaults; they are not a claim about what is currently saved in production.

The page uses `mergeCopy`: absent values get the reference defaults; old values equal to previous defaults upgrade; edited values win. Edited editorial lists (features/steps/dashboard), resized lists and reordered lists stay intact, so their titles and descriptions cannot be mixed with unrelated new items. Same-shape pricing objects upgrade untouched leaves while preserving edited prices/notes/links. New dashboard saves carry `_designVersion: 2` in the existing JSON, preserving subsequent explicit edits even when they equal an old default. No migration is needed.

An old value deliberately set to exactly the old default cannot be distinguished from an untouched default without audit history. Such values adopt the new default on the first read. Saved appearance values are always preserved; only absent appearance values receive the warm reference palette and Kufam/Manrope.

## Sections in default order

| Order | Section | Copy sources | Visibility / integration |
|---|---|---|---|
| Header | Shared navigation | nav.*, cta, ctaUrl, login, tagline, design.menu*, design.languageLabel, design.loginUrl, design.homeLabel, design.theme*, design.blogLabel | Shared by landing, blog and legal; mobile menu state; existing language/login/blog/theme links |
| 1 | hero | hero*, design.hero* | Text + portfolio mock + phone + cards; uploaded hero image replaces the mock portrait, with its dim control applied there |
| 2 | compare | compare*, design.compare* | Reference scattered-links / unified-site comparison; custom comparison CTA retained |
| 3 | studio | design.studio* | Keyboard tabs, swatches, preview-only dark mode, filters and reorder; no persistence |
| 4, optional | panel | panel*, mock.*, design.playVideo, design.closeVideo | Original VideoFacade / PlayVideoButton; shown with media or customised panel copy |
| 5, optional | dashboard | dash*, design.playVideo, design.closeVideo | Original DashShowcase; shown with media or customised tour copy; framing controls retained |
| 6 | features + blog banner | features*, design.features* | Existing icon/image/tint/background controls; editable blog link |
| 7 | showcase | showcase*, visit, design.showcase* | Real tenant names, links and images from showcase.ts; hidden/order/picture/framing controls retained |
| 8 | how | how*, howAccent | Reference steps; custom step CTA retained |
| 9 | pricing | pricing*, plans.*, design.pricingPaymentNote | Reference $10 / $90 / $500 defaults; edited prices and payment links win; billing logic unchanged |
| 10, conditional | metrics | metricsLabels.* | Existing real DB counts only, with the original 12-site floor |
| 11, conditional | testimonials | testimonials*, testimonials.* | Only actual owner-added quotes |
| 12 | faq | faq*, faqs.*, design.faq* | Native keyboard-accessible details; first answer initially open; FAQPage follows visibility |
| 13 | cta | ctaTitle, ctaAccent, ctaSub, ctaBtn, ctaBtnUrl, design.cta* | Final banner retained |
| Footer | Shared footer | footerNote, footerGroups.*, legalHeading, legal.*, rights, tagline, waNumber, phone, design.footer*, design.backTop | Existing legal/blog/contact links retained |
| Fixed on phones | Trial bar | design.mobile* | Bottom padding and ContactFabs offset prevent overlap with the bar |

Saved custom order and visibility remain effective. The old unmodified default sequence upgrades to this sequence while retaining hidden flags. For other saved sequences, the new studio section is inserted after comparison. Hero remains movable, as it was before this change. Audience is removed from the renderable section list.

## Editor fields

- Existing scalar fields, feature/step/plan/FAQ lists, SEO, contact, legal, footer groups, media, showcase framing, colours, fonts and section-order controls remain in their existing tabs.
- Added `compareAccent`, `featuresAccent`, `showcaseAccent`, `howAccent`, `pricingAccent`, `faqAccent`, `ctaAccent` for independently editable emphasis.
- Added `design.*` for every new preview/art/banner/menu/footer/accessibility string, the two illustration image URLs, trial/mobile/FAQ/blog links and labels. The Arabic-labelled “نصوص التصميم والمعاينة” tab groups these fields by section. Plan WhatsApp messages remain editable within each plan's URL field.
- The audience heading/subheading/list fields remain stored and editable, with an explicit retirement note; they no longer render because the designer requires removal of that strip. Its old background row is retained in storage but has no public section.
- `featuresSub`, `compareLink*`, `howBtn*`, `pricingIncluded*`, `tagline` are empty in the reference defaults; owner custom values still render in sensible adjacent positions.
- Panel/mock and dashboard-tour fields remain functional as optional extras. A previously unedited placeholder tour does not add sections to the approved default design.
- LandingEditor uses an iframe refreshed after save and has no DOM apply callback. Existing anchors are retained; the new copy tab targets the studio anchor.

## Adaptations and limits

- The new studio reuses the existing `panel` SectionBg setting, labelled “المعاينة وفيديو الشرح”, so no Postgres enum migration is required. If an explainer is also enabled, both use that background setting.
- Hero imagery is placed inside the portfolio artwork, not as a full-bleed background. The old hero dim control affects that image. The reference artwork image URLs are editable as well.
- Showcase is driven entirely by actual tenants. Ahmed/Kamal are not fabricated as fallback records; their cards appear when the existing real-tenant selection includes them. Empty data shows the existing editable empty state.
- Retained shared landing CSS needed by blog/legal/media/extras; removed superseded hero/comparison/steps/pricing/CTA rules after checking consumers. Reference CSS is separately scoped and retains the effective late centred-heading/mobile overrides. Unused full-bleed-hero and audience-strip rules were removed.
- Only the two used WebP illustrations ship. Fonts use the existing next/font variables, with no bundled reference woff2 files.
- Analytics stays disabled for owner preview; metadata/hreflang/platformLocale/landingSeo remain in the existing page flow. Shared ContactFabs/VideoFacade/PlayVideoButton/DashShowcase/SectionBg behavior was not changed.
- Browser visual comparison and browser interaction/hydration checks at 390/768/1440 are **not verified**. A static local-file fixture was prepared without starting a server; the installed Chrome process exited 134 before producing a screenshot. SSR and static accessibility checks are not a substitute for those browser checks.
- Database-backed saved values, tenant imagery and dashboard save/reload could not be exercised without the database. No production content was read or written.

## Validation

Requested gates (both exit code 0; stdout/stderr empty):

```text
$ npx tsc --noEmit -p .
$ git diff --check
```

Additional local checks, verbatim:

```text
ar: SSR, copy reconciliation, owner overrides, removed-list preservation, tab semantics passed
en: SSR, copy reconciliation, owner overrides, removed-list preservation, tab semantics passed
Section order, new-section placement and saved visibility passed
Landing reference CSS: 547 selectors scoped; parsing passed
Referenced landing images exist; no reference fonts shipped
```

## Files (one per line)

- Created: `docs/landing-redesign-report.md`
- Created: `public/viralpx-landing/assets/image-11.webp`
- Created: `public/viralpx-landing/assets/image-48.webp`
- Changed: `src/app/(frontend)/blog/[slug]/page.tsx`
- Changed: `src/app/(frontend)/blog/page.tsx`
- Created: `src/app/(frontend)/landing-reference.css`
- Changed: `src/app/(frontend)/landing.css`
- Changed: `src/app/(frontend)/legal/[slug]/page.tsx`
- Changed: `src/app/(frontend)/page.tsx`
- Changed: `src/components/dashboard/LandingEditor.tsx`
- Changed: `src/components/portfolio/LandingChrome.tsx`
- Created: `src/components/portfolio/LandingMenu.tsx`
- Created: `src/components/portfolio/LandingSections.tsx`
- Created: `src/components/portfolio/LandingStudio.tsx`
- Changed: `src/components/portfolio/LandingThemeToggle.tsx`
- Changed: `src/globals/Landing.ts`
- Changed: `src/lib/design-types.ts`
- Changed: `src/lib/landing-actions.ts`
- Changed: `src/lib/landing-copy.ts`
- Changed: `src/lib/landing-look.ts`
- Changed: `src/lib/landing-order.ts`
- Created: `src/lib/landing-reference-copy.ts`

Deleted existing files: none.

## Exhaustive default/reference conflicts

For every row below, production saved value is **unknown**. The “new default” column is what an untouched site shows; an edited saved value/list takes precedence as described above. “—” means the key or list element is absent. Rows introduced by the design are marked NEW.

### AR

| Key | Previous default | New reference default | Selection |
|---|---|---|---|
| `nav.showcase` | "أمثلة" | "نماذج" | Edited saved value/list wins; otherwise new default |
| `nav.compare` | "ليه إحنا؟" | "لماذا ViralPX؟" | Edited saved value/list wins; otherwise new default |
| `cta` | "ابدأ مجانًا" | "ابدأ مجاناً" | Edited saved value/list wins; otherwise new default |
| `ctaUrl` | "/login" | "https://wa.me/971558710190" | Edited saved value/list wins; otherwise new default |
| `tagline` | "SHOW. GROW. WIN." | "" | Edited saved value/list wins; otherwise new default |
| `heroEyebrow` | "أول شهر عليك مجانًا" | "مساحة واحدة. كل إبداعك." | Edited saved value/list wins; otherwise new default |
| `heroTitle` | "شغلك يستاهل موقع باسمك،" | "شغلك يستاهل\nموقع" | Edited saved value/list wins; otherwise new default |
| `heroTitleAccent` | "مش لينك درايف." | "باسمك." | Edited saved value/list wins; otherwise new default |
| `heroSub` | "ViralPX بيحوّل مشاريعك وريلزك ومقالاتك لموقع احترافي على دومينك الخاص — بالعربي والإنجليزي، من غير سطر كود. جرّبه شهر كامل مجانًا بكل المميزات." | "اجمع مشاريعك وصورك وفيديوهاتك في بورتفوليو يشبهك. تحكّم في التفاصيل، وشارك أعمالك بثقة." | Edited saved value/list wins; otherwise new default |
| `heroTitleBreak` | true | false | Edited saved value/list wins; otherwise new default |
| `heroBtn1` | "ابدأ شهرك المجاني" | "اطلب تجربتك المجانية" | Edited saved value/list wins; otherwise new default |
| `heroBtn2` | "شوف بورتفوليو حقيقي" | "شاهد النماذج" | Edited saved value/list wins; otherwise new default |
| `heroNote` | "من غير بطاقة دفع · كل المميزات مفتوحة · تلغي في أي وقت" | "30 يوماً مجاناً · دون بطاقة دفع" | Edited saved value/list wins; otherwise new default |
| `heroBtn2Url` | "" | "#showcase" | Edited saved value/list wins; otherwise new default |
| `featuresEyebrow` | "المميزات" | "التفاصيل تصنع الفرق" | Edited saved value/list wins; otherwise new default |
| `featuresTitle` | "كل اللي يخلّي العميل يقول: «عايز أشتغل معاه»" | "كل ما يحتاجه شغلك." | Edited saved value/list wins; otherwise new default |
| `featuresSub` | "ومش هتدفع زيادة عشان أي ميزة — كله موجود في كل الخطط." | "" | Edited saved value/list wins; otherwise new default |
| `features[0].icon` | "globe" | "▧" | Edited saved value/list wins; otherwise new default |
| `features[0].t` | "دومينك الخاص" | "صور، مشاريع وريلز" | Edited saved value/list wins; otherwise new default |
| `features[0].d` | "⁦اسمك.com⁩ بدل لينك طويل — مع شهادة SSL مجانية وتلقائية." | "اعرض أعمالك بمقاسها المناسب، مع صفحات للمشاريع وريلز عمودية دون قص." | Edited saved value/list wins; otherwise new default |
| `features[1].icon` | "palette" | "ع / EN" | Edited saved value/list wins; otherwise new default |
| `features[1].t` | "تصميم على مقاسك" | "بلغتك. ولغة جمهورك." | Edited saved value/list wins; otherwise new default |
| `features[1].d` | "ألوانك وخطوطك وترتيب أقسامك — من لوحة التحكم، وبالعربي كامل." | "موقع ولوحة تحكم بالعربية والإنجليزية، مع محتوى تكتبه باللغتين." | Edited saved value/list wins; otherwise new default |
| `features[2].icon` | "image" | "Bē" | Edited saved value/list wins; otherwise new default |
| `features[2].t` | "مشاريع وريلز" | "أعمالك تنتقل معك" | Edited saved value/list wins; otherwise new default |
| `features[2].d` | "عارض ريلز 9:16 وصور وهايلايتس — شغلك يتعرض بالشكل اللي يستاهله." | "استورد مشاريعك من Behance دون إعادة رفعها من البداية." | Edited saved value/list wins; otherwise new default |
| `features[3].icon` | "zap" | "◷" | Edited saved value/list wins; otherwise new default |
| `features[3].t` | "سريع وبيظهر في جوجل" | "افهم اهتمام جمهورك" | Edited saved value/list wins; otherwise new default |
| `features[3].d` | "صور WebP وSitemap وبيانات منظمة — موقع سريع وسهل يلاقوك فيه." | "تابع مصادر الزيارات، وتعرّف على أكثر مشاريعك مشاهدة." | Edited saved value/list wins; otherwise new default |
| `features[4].icon` | "edit" | "“" | Edited saved value/list wins; otherwise new default |
| `features[4].t` | "مدونة تبني ثقتك" | "ثقة يكتبها عملاؤك" | Edited saved value/list wins; otherwise new default |
| `features[4].d` | "اكتب مقالاتك مع SEO جاهز لكل مقال — وخلّي خبرتك تتكلم عنك." | "أرسل رابط التقييم لعميلك، وراجع رأيه قبل نشره على موقعك." | Edited saved value/list wins; otherwise new default |
| `features[5].icon` | "mail" | "✉" | Edited saved value/list wins; otherwise new default |
| `features[5].t` | "العميل يوصلك فورًا" | "الحديث يبدأ بسهولة" | Edited saved value/list wins; otherwise new default |
| `features[5].d` | "نموذج تواصل بيوصل على إيميلك مباشرة، وزر واتساب على موقعك." | "واتساب واتصال ونموذج تواصل، ليختار العميل الطريقة الأنسب له." | Edited saved value/list wins; otherwise new default |
| `howEyebrow` | "الطريقة" | "خطوات بسيطة" | Edited saved value/list wins; otherwise new default |
| `howTitle` | "موقعك يبقى جاهز النهارده" | "من أعمالك،" | Edited saved value/list wins; otherwise new default |
| `how[0].n` | "1" | "تواصل" | Edited saved value/list wins; otherwise new default |
| `how[0].t` | "كلّمنا على واتساب" | "اطلب تجربتك" | Edited saved value/list wins; otherwise new default |
| `how[0].d` | "ابعتلنا رسالة وهنجهّزلك موقعك، ويوصلك إيميل تختار منه كلمة السر — من غير بطاقة دفع." | "راسلنا على واتساب. نجهّز حسابك ونرسل رابط اختيار كلمة المرور إلى بريدك." | Edited saved value/list wins; otherwise new default |
| `how[1].n` | "2" | "خصّص" | Edited saved value/list wins; otherwise new default |
| `how[1].t` | "ضيف شغلك" | "أضف لمستك" | Edited saved value/list wins; otherwise new default |
| `how[1].d` | "ارفع مشاريعك وريلزك ومقالاتك، ورتّب الأقسام زي ما تحب." | "ارفع أعمالك أو استوردها من Behance، واختر الألوان والخطوط وترتيب الأقسام." | Edited saved value/list wins; otherwise new default |
| `how[2].n` | "3" | "شارك" | Edited saved value/list wins; otherwise new default |
| `how[2].t` | "انشر واستقبل عملاء" | "انطلق برابطك" | Edited saved value/list wins; otherwise new default |
| `how[2].d` | "اربط دومينك وشارك موقعك، والعملاء يكلموك مباشرة." | "أرسل موقعك للعملاء، واجمع أعمالك وخبراتك ووسائل التواصل في مكان واحد." | Edited saved value/list wins; otherwise new default |
| `howBtn` | "ابدأ الخطوة الأولى" | "" | Edited saved value/list wins; otherwise new default |
| `showcaseEyebrow` | "أمثلة حية" | "نماذج حية" | Edited saved value/list wins; otherwise new default |
| `showcaseTitle` | "مبدعين عرب بيعرضوا شغلهم على ViralPX" | "نفس المنصّة." | Edited saved value/list wins; otherwise new default |
| `showcaseSub` | "دوس على أي بورتفوليو وشوف بنفسك التجربة اللي عملاءهم بيشوفوها." | "مساحة تتكيّف معك، سواء كنت مصمّماً، مصوّراً، محرر فيديو، مصمّم موشن أو UI/UX، أو كاتب محتوى." | Edited saved value/list wins; otherwise new default |
| `visit` | "زور الموقع" | "شاهد الموقع" | Edited saved value/list wins; otherwise new default |
| `compareEyebrow` | "الفرق" | "حضور متكامل" | Edited saved value/list wins; otherwise new default |
| `compareTitle` | "العميل بيحكم عليك من أول 5 ثواني" | "روابط أقل." | Edited saved value/list wins; otherwise new default |
| `compareSub` | "لينك الدرايف بيقول إنك بتجرّب. الموقع باسمك بيقول إنك محترف." | "امنح العميل تجربة متكاملة، من أول مشروع يشاهده إلى أول رسالة يرسلها." | Edited saved value/list wins; otherwise new default |
| `compareOldTitle` | "لينك درايف أو منصة عامة" | "أعمال موزّعة بين الروابط" | Edited saved value/list wins; otherwise new default |
| `compareOld[0]` | "العميل بيشوف شغل منافسينك جنب شغلك." | "ملف أعمال.pdf" | Edited saved value/list wins; otherwise new default |
| `compareOld[1]` | "الفيديو بيتقطّع ويفتح بمقاس غلط." | "الفيديوهات" | Edited saved value/list wins; otherwise new default |
| `compareOld[2]` | "لينك طويل من غير اسمك — بيقلل من قيمة سعرك." | "نبذتي وخبراتي" | Edited saved value/list wins; otherwise new default |
| `compareOld[3]` | "مفيش طريقة سريعة العميل يكلمك بيها." | — | Edited saved value/list wins; otherwise new default |
| `compareNewTitle` | "بورتفوليو على ViralPX" | "رابط واحد يمثّلك." | Edited saved value/list wins; otherwise new default |
| `compareNew[0]` | "الصفحة كلها ليك — اسمك وشغلك وبس." | "أعمالك بأنواعها في مكان واحد" | Edited saved value/list wins; otherwise new default |
| `compareNew[1]` | "الريلز بتشتغل 9:16 بسرعة على الموبايل." | "خبراتك وخدماتك ووسائل التواصل معاً" | Edited saved value/list wins; otherwise new default |
| `compareNew[2]` | "دومين باسمك — انطباع محترف من أول لحظة." | "ألوان وخطوط وترتيب تختارها بنفسك" | Edited saved value/list wins; otherwise new default |
| `compareNew[3]` | "زر واتساب ونموذج تواصل — العميل يكلمك في نفس اللحظة." | — | Edited saved value/list wins; otherwise new default |
| `compareLink` | "جرّب الفرق مجانًا" | "" | Edited saved value/list wins; otherwise new default |
| `pricingEyebrow` | "الأسعار" | "مساحة لإبداعك، وخطّة تناسبك" | Edited saved value/list wins; otherwise new default |
| `pricingTitle` | "جرّب شهر كامل مجانًا، وبعدها اختار اللي يريحك" | "الشهر الأول" | Edited saved value/list wins; otherwise new default |
| `pricingSub` | "كل الخطط فيها كل المميزات بالكامل — الفرق الوحيد هو طريقة الدفع." | "جرّب جميع المميزات لمدة 30 يوماً، ثم اختر طريقة الاشتراك المناسبة لك." | Edited saved value/list wins; otherwise new default |
| `plans[0].price` | "199" | "$10" | Edited saved value/list wins; otherwise new default |
| `plans[0].per` | "/ شهريًا" | "/ شهر" | Edited saved value/list wins; otherwise new default |
| `plans[0].note` | "مرونة كاملة من غير التزام طويل." | "مرونة في الاشتراك والإلغاء." | Edited saved value/list wins; otherwise new default |
| `plans[0].feats[0]` | "ادفع شهر بشهر" | "جميع المميزات" | Edited saved value/list wins; otherwise new default |
| `plans[0].feats[1]` | "الغي في أي وقت" | "موقع باسمك على ViralPX" | Edited saved value/list wins; otherwise new default |
| `plans[0].feats[2]` | "كل المميزات" | "إدارة المحتوى والتصميم" | Edited saved value/list wins; otherwise new default |
| `plans[0].cta` | "ابدأ شهرك المجاني" | "اطلب تجربتك المجانية" | Edited saved value/list wins; otherwise new default |
| `plans[0].url` | "" | "https://wa.me/971558710190?text=أرغب%20في%20تجربة%20ViralPX%20والخطة%20الشهرية" | Edited saved value/list wins; otherwise new default |
| `plans[1].badge` | "الأوفر" | "وفّر 25%" | Edited saved value/list wins; otherwise new default |
| `plans[1].price` | "1,990" | "$90" | Edited saved value/list wins; otherwise new default |
| `plans[1].per` | "/ سنويًا" | "/ سنة" | Edited saved value/list wins; otherwise new default |
| `plans[1].note` | "يعني حوالي 166 في الشهر — وفّر شهرين" | "مساحة لشغلك طوال العام." | Edited saved value/list wins; otherwise new default |
| `plans[1].feats[0]` | "شهرين مجانًا كل سنة" | "جميع المميزات" | Edited saved value/list wins; otherwise new default |
| `plans[1].feats[1]` | "سعرك ثابت طول السنة" | "أوفر من الدفع الشهري" | Edited saved value/list wins; otherwise new default |
| `plans[1].feats[2]` | "كل المميزات" | "إدارة المحتوى والتصميم" | Edited saved value/list wins; otherwise new default |
| `plans[1].cta` | "ابدأ شهرك المجاني" | "اطلب تجربتك المجانية" | Edited saved value/list wins; otherwise new default |
| `plans[1].url` | "" | "https://wa.me/971558710190?text=أرغب%20في%20تجربة%20ViralPX%20والخطة%20السنوية" | Edited saved value/list wins; otherwise new default |
| `plans[2].name` | "مرة واحدة" | "دفعة واحدة" | Edited saved value/list wins; otherwise new default |
| `plans[2].badge` | "دفعة واحدة" | "" | Edited saved value/list wins; otherwise new default |
| `plans[2].price` | "4,990" | "$500" | Edited saved value/list wins; otherwise new default |
| `plans[2].per` | "/ مرة واحدة" | "" | Edited saved value/list wins; otherwise new default |
| `plans[2].note` | "ادفع مرة واحدة — الاستضافة وكل المميزات والتحديثات، من غير اشتراك." | "دون اشتراك متكرّر." | Edited saved value/list wins; otherwise new default |
| `plans[2].feats[0]` | "من غير اشتراكات متجددة" | "جميع المميزات" | Edited saved value/list wins; otherwise new default |
| `plans[2].feats[1]` | "كل التحديثات الجاية مشمولة" | "الاستضافة والتحديثات" | Edited saved value/list wins; otherwise new default |
| `plans[2].feats[2]` | "كل المميزات" | "إدارة المحتوى والتصميم" | Edited saved value/list wins; otherwise new default |
| `plans[2].cta` | "ابدأ شهرك المجاني" | "اطلب تجربتك المجانية" | Edited saved value/list wins; otherwise new default |
| `plans[2].url` | "" | "https://wa.me/971558710190?text=أرغب%20في%20معرفة%20تفاصيل%20خطة%20ViralPX%20دفعة%20واحدة" | Edited saved value/list wins; otherwise new default |
| `pricingIncludedTitle` | "في كل خطة:" | "" | Edited saved value/list wins; otherwise new default |
| `pricingIncluded[0]` | "دومين خاص + SSL" | — | Edited saved value/list wins; otherwise new default |
| `pricingIncluded[1]` | "تصميم قابل للتخصيص" | — | Edited saved value/list wins; otherwise new default |
| `pricingIncluded[2]` | "مشاريع وريلز 9:16" | — | Edited saved value/list wins; otherwise new default |
| `pricingIncluded[3]` | "مدونة مع SEO" | — | Edited saved value/list wins; otherwise new default |
| `pricingIncluded[4]` | "نموذج تواصل وزر واتساب" | — | Edited saved value/list wins; otherwise new default |
| `pricingIncluded[5]` | "عربي وإنجليزي" | — | Edited saved value/list wins; otherwise new default |
| `pricingIncluded[6]` | "دعم فني" | — | Edited saved value/list wins; otherwise new default |
| `pricingNote` | "أول 30 يوم مجانًا على أي خطة · من غير بطاقة دفع" | "جميع الخطط تشمل المميزات نفسها. شراء الدومين الخاص وتجديده منفصلان عن الاشتراك." | Edited saved value/list wins; otherwise new default |
| `faqEyebrow` | "إجابات سريعة" | "الأسئلة الشائعة" | Edited saved value/list wins; otherwise new default |
| `faqTitle` | "قبل ما تبدأ" | "قبل أن" | Edited saved value/list wins; otherwise new default |
| `faqs[0].q` | "العميل هياخدني بجدية أكتر بموقع؟" | "هل أحتاج إلى معرفة البرمجة؟" | Edited saved value/list wins; otherwise new default |
| `faqs[0].a` | "الموقع باسمك وعلى دومينك بيقول إنك شغّال بجد مش بتجرّب. العميل بيشوف شغلك لوحده من غير منافسين جنبه، ويقدر يكلمك بضغطة على واتساب." | "لا. يمكنك تعديل المحتوى والتصميم من لوحة التحكم، وترتيب المشاريع والأقسام بالسحب والإفلات." | Edited saved value/list wins; otherwise new default |
| `faqs[1].q` | "إيه اللي بيحصل بعد الشهر المجاني؟" | "كيف أبدأ التجربة المجانية؟" | Edited saved value/list wins; otherwise new default |
| `faqs[1].a` | "قبل ما الشهر يخلص بنبعتلك تنبيه، وتختار الخطة اللي تناسبك. لو ماخترتش، موقعك بيتوقف مؤقتًا ومحتواك بيفضل محفوظ." | "تواصل معنا عبر واتساب. نجهّز حسابك ونرسل إليك رسالة بريد إلكتروني لاختيار كلمة المرور والبدء." | Edited saved value/list wins; otherwise new default |
| `faqs[2].q` | "محتاج أدخل بطاقة دفع عشان أجرّب؟" | "ماذا يحدث بعد انتهاء التجربة؟" | Edited saved value/list wins; otherwise new default |
| `faqs[2].a` | "لأ. كلّمنا على واتساب وهنجهّزلك موقعك على طول — مش هتدفع حاجة غير لما تختار خطة." | "إذا رغبت في الاستمرار، تختار خطتك وتنسّق الدفع مع الفريق. لا نطلب بطاقة دفع للتجربة، ولا يوجد خصم تلقائي." | Edited saved value/list wins; otherwise new default |
| `faqs[3].q` | "إيه الفرق بين الخطط؟" | "هل أحتاج إلى شراء دومين؟" | Edited saved value/list wins; otherwise new default |
| `faqs[3].a` | "المميزات واحدة في كل الخطط. الفرق بس في طريقة الدفع: شهري لو عايز مرونة، سنوي لو عايز توفّر، ومرة واحدة لو مش عايز اشتراكات خالص." | "لا. يمكنك استخدام رابط باسمك داخل viralpx.com، أو ربط دومين خاص تملكه. شراء الدومين وتجديده مسؤوليتك، حتى مع خطة الدفعة الواحدة." | Edited saved value/list wins; otherwise new default |
| `faqs[4].q` | "خطة المرة الواحدة بتشمل إيه بالظبط؟" | "هل يمكنني نقل مشاريعي من Behance؟" | Edited saved value/list wins; otherwise new default |
| `faqs[4].a` | "الاستضافة وكل المميزات والتحديثات الجاية، من غير أي اشتراك. تجديد الدومين نفسه بيكون عليك سنويًا من الشركة اللي اشتريته منها." | "نعم. يمكنك استيراد مشاريعك إلى موقعك بدلًا من إعادة رفعها من البداية." | Edited saved value/list wins; otherwise new default |
| `faqs[5].q` | "أقدر ألغي؟ وموقعي يحصله إيه؟" | "هل يدعم الموقع العربية والإنجليزية؟" | Edited saved value/list wins; otherwise new default |
| `faqs[5].a` | "أيوه، تقدر تغيّر خطتك أو تلغي في أي وقت. لو لغيت، موقعك بيتوقف مؤقتًا ومحتواك بيفضل محفوظ، ولو رجعت بيرجع زي ما هو. والدومين اللي اشتريته باسمك ملكك إنت." | "نعم. الموقع ولوحة التحكم متاحان باللغتين، ويمكنك كتابة محتواك بالعربية والإنجليزية ليختار الزائر اللغة المناسبة." | Edited saved value/list wins; otherwise new default |
| `faqs[6].q` | "محتاج أعرف كود؟" | "هل الموقع مناسب للهاتف؟" | Edited saved value/list wins; otherwise new default |
| `faqs[6].a` | "خالص. كل حاجة بتتعدّل من لوحة التحكم بخانات واختيارات بسيطة، والترتيب بالسحب والإفلات." | "نعم. يتكيّف الموقع مع شاشة الهاتف، مع عرض مناسب للريلز وأزرار تسهّل الوصول إلى وسائل التواصل." | Edited saved value/list wins; otherwise new default |
| `faqs[7].q` | "الموقع بياخد قد إيه لحد ما يجهز؟" | "هل يساعد الموقع على الظهور في البحث؟" | Edited saved value/list wins; otherwise new default |
| `faqs[7].a` | "لو شغلك جاهز، تقدر تنشره في نفس اليوم: الموقع بيفتح بنصوص جاهزة على مجالك، وانت بتضيف مشاريعك وتعدّل اللي عايزه وتنشر." | "يتضمن أدوات لتهيئة الصفحات لمحركات البحث، مثل العناوين والأوصاف وخريطة الموقع. الظهور والترتيب يعتمدان على عوامل متعددة، ولا يمكن ضمانهما." | Edited saved value/list wins; otherwise new default |
| `faqs[8].q` | "معنديش مشاريع جاهزة، أبدأ إزاي؟" | "ماذا يحدث إذا ألغيت الاشتراك؟" | Edited saved value/list wins; otherwise new default |
| `faqs[8].a` | "ابدأ باللي عندك — ٣ لـ٥ شغلانات كويسة أحسن من ٢٠ عادية، وتقدر تضيف مشاريع شخصية أو تجارب. والأقسام اللي لسه فاضية مش بتظهر للزوار، فالموقع بيبان كامل من أول يوم." | "يتوقف الموقع مؤقتًا، ويظل المحتوى محفوظًا لاستعادته عند العودة." | Edited saved value/list wins; otherwise new default |
| `faqs[9].q` | "أقدر أربط دوميني؟ ومين يملكه؟" | — | Edited saved value/list wins; otherwise new default |
| `faqs[9].a` | "أيوه، والـSSL بيتفعّل تلقائي. الدومين بتشتريه باسمك من أي شركة دومينات، وبيفضل ملكك حتى لو سبت ViralPX. ولو معندكش دومين، بنقولك تشتريه إزاي خطوة بخطوة." | — | Edited saved value/list wins; otherwise new default |
| `faqs[10].q` | "الموقع بيدعم العربي والإنجليزي؟" | — | Edited saved value/list wins; otherwise new default |
| `faqs[10].a` | "أيوه، الموقع كامل باللغتين، والزائر يبدّل بينهم بضغطة." | — | Edited saved value/list wins; otherwise new default |
| `faqs[11].q` | "بياناتي في أمان؟" | — | Edited saved value/list wins; otherwise new default |
| `faqs[11].a` | "الموقع شغال على HTTPS، وبنعمل نسخة احتياطية من بياناتك كل 6 ساعات ونحفظها في مكان منفصل." | — | Edited saved value/list wins; otherwise new default |
| `ctaTitle` | "شغلك جاهز. ناقصه بس موقع يليق بيه." | "باقي المساحة\nاللي" | Edited saved value/list wins; otherwise new default |
| `ctaSub` | "ابدأ شهرك المجاني النهارده — كل المميزات مفتوحة، ومن غير بطاقة دفع." | "ابدأ تجربتك، وامنح شغلك عنواناً خاصاً." | Edited saved value/list wins; otherwise new default |
| `ctaBtn` | "ابدأ شهرك المجاني" | "اطلب تجربتك المجانية" | Edited saved value/list wins; otherwise new default |
| `footerNote` | "منصة بورتفوليو للمصممين وصنّاع المحتوى العرب." | "اعرض أعمالك باسمك، وخصّص موقعك بنفسك، واجعل التواصل معك أسهل." | Edited saved value/list wins; otherwise new default |
| `footerGroups[0].title` | "الموقع" | "استكشف" | Edited saved value/list wins; otherwise new default |
| `footerGroups[0].links[1].label` | "الأمثلة" | "النماذج" | Edited saved value/list wins; otherwise new default |
| `footerGroups[1].title` | "تعرف أكتر" | "اعرف أكثر" | Edited saved value/list wins; otherwise new default |
| `footerGroups[1].links[0].label` | "ليه إحنا؟" | "لماذا ViralPX؟" | Edited saved value/list wins; otherwise new default |
| `footerGroups[1].links[1].label` | "الأسئلة" | "الأسئلة الشائعة" | Edited saved value/list wins; otherwise new default |
| `rights` | "كل الحقوق محفوظة" | "جميع الحقوق محفوظة" | Edited saved value/list wins; otherwise new default |
| `waNumber` | "" | "971558710190" | Edited saved value/list wins; otherwise new default |
| `phone` | "" | "+971 55 871 0190" | Edited saved value/list wins; otherwise new default |
| `pricingIncluded` | — | [] | NEW — saved override or new default |
| `compareAccent` | — | "صورة أوضح عنك." | NEW — saved override or new default |
| `featuresAccent` | — | "في مكانه الصحيح." | NEW — saved override or new default |
| `showcaseAccent` | — | "شخصيات مختلفة." | NEW — saved override or new default |
| `howAccent` | — | "إلى موقعك." | NEW — saved override or new default |
| `pricingAccent` | — | "علينا." | NEW — saved override or new default |
| `faqAccent` | — | "تبدأ." | NEW — saved override or new default |
| `ctaAccent` | — | "تليق بها." | NEW — saved override or new default |
| `design.ctaEyebrow` | — | "أعمالك جاهزة" | NEW — saved override or new default |
| `design.pricingPaymentNote` | — | "دون بطاقة دفع للتجربة · الاشتراك والدفع بالتنسيق مع الفريق عبر واتساب" | NEW — saved override or new default |
| `design.studio1` | — | "أنت صاحب المساحة" | NEW — saved override or new default |
| `design.studio2` | — | "موقعك." | NEW — saved override or new default |
| `design.studio3` | — | "على طريقتك." | NEW — saved override or new default |
| `design.studio4` | — | "عدّل المحتوى، اختر الألوان، ورتّب الأقسام." | NEW — saved override or new default |
| `design.studio5` | — | "دون برمجة، ودون انتظار أحد." | NEW — saved override or new default |
| `design.studio6` | — | "استكشف لوحة التحكم" | NEW — saved override or new default |
| `design.studio7` | — | "ألوانك وهويتك" | NEW — saved override or new default |
| `design.studio8` | — | "مشاريعك ومحتواك" | NEW — saved override or new default |
| `design.studio9` | — | "أقسامك وترتيبها" | NEW — saved override or new default |
| `design.studio10` | — | "معاينة تفاعلية" | NEW — saved override or new default |
| `design.studio11` | — | "لون يعبّر عنك." | NEW — saved override or new default |
| `design.studio12` | — | "جرّب لوحة الألوان، وشاهد كيف تتغيّر هوية الموقع أمامك." | NEW — saved override or new default |
| `design.studio13` | — | "لون المعاينة" | NEW — saved override or new default |
| `design.studio14` | — | "برتقالي دافئ" | NEW — saved override or new default |
| `design.studio15` | — | "بنفسجي" | NEW — saved override or new default |
| `design.studio16` | — | "أخضر" | NEW — saved override or new default |
| `design.studio17` | — | "جرّب المظهر الداكن" | NEW — saved override or new default |
| `design.studio18` | — | "نوع الأعمال" | NEW — saved override or new default |
| `design.studio19` | — | "الكل" | NEW — saved override or new default |
| `design.studio20` | — | "تصاميم" | NEW — saved override or new default |
| `design.studio21` | — | "فيديو" | NEW — saved override or new default |
| `design.studio22` | — | "قدّم النبذة على الأعمال" | NEW — saved override or new default |
| `design.studio23` | — | "جرّب ترتيب الأقسام في هذه المعاينة." | NEW — saved override or new default |
| `design.studio24` | — | "your-portfolio.viralpx.com" | NEW — saved override or new default |
| `design.studio25` | — | "م" | NEW — saved override or new default |
| `design.studio26` | — | "مساحة لإبداعك." | NEW — saved override or new default |
| `design.studio27` | — | "مصمّم. صانع. صاحب فكرة." | NEW — saved override or new default |
| `design.studio28` | — | "لنتحدث" | NEW — saved override or new default |
| `design.studio29` | — | "VISUAL" | NEW — saved override or new default |
| `design.studio30` | — | "STORIES." | NEW — saved override or new default |
| `design.studio31` | — | "هوية بصرية" | NEW — saved override or new default |
| `design.studio32` | — | "أفكار" | NEW — saved override or new default |
| `design.studio33` | — | "تُرى." | NEW — saved override or new default |
| `design.studio34` | — | "تصميم إعلاني" | NEW — saved override or new default |
| `design.studio35` | — | "قصص تتحرّك" | NEW — saved override or new default |
| `design.studio36` | — | "ريلز وفيديو" | NEW — saved override or new default |
| `design.studio37` | — | "عنّي" | NEW — saved override or new default |
| `design.studio38` | — | "أحوّل الأفكار إلى تجارب بصرية تحكي قصتها." | NEW — saved override or new default |
| `design.studio39` | — | "معاينة توضيحية للتخصيص. إدارة موقعك الفعلية تتم من حسابك على ViralPX." | NEW — saved override or new default |
| `design.hero1` | — | "تصوّر لطريقة عرض البورتفوليو" | NEW — saved override or new default |
| `design.hero2` | — | "viralpx.com / you" | NEW — saved override or new default |
| `design.hero3` | — | "am®" | NEW — saved override or new default |
| `design.hero4` | — | "أعمالي   عنّي   لنتحدث" | NEW — saved override or new default |
| `design.hero5` | — | "أصمّم ما يلفت." | NEW — saved override or new default |
| `design.hero6` | — | "وأبني ما يفيد." | NEW — saved override or new default |
| `design.hero7` | — | "أحمد محمود" | NEW — saved override or new default |
| `design.hero8` | — | "هوية بصرية" | NEW — saved override or new default |
| `design.hero9` | — | "FORM" | NEW — saved override or new default |
| `design.hero10` | — | "STUDIO." | NEW — saved override or new default |
| `design.hero11` | — | "فنّ التفاصيل" | NEW — saved override or new default |
| `design.hero12` | — | "فكرة." | NEW — saved override or new default |
| `design.hero13` | — | "تترك أثراً." | NEW — saved override or new default |
| `design.hero14` | — | "MAKE" | NEW — saved override or new default |
| `design.hero15` | — | "IT MOVE." | NEW — saved override or new default |
| `design.hero16` | — | "موشن جرافيك" | NEW — saved override or new default |
| `design.hero17` | — | "هويتك، بكل تفاصيلها." | NEW — saved override or new default |
| `design.hero18` | — | "ألوانك · أعمالك · أسلوبك" | NEW — saved override or new default |
| `design.hero19` | — | "YOUR" | NEW — saved override or new default |
| `design.hero20` | — | "WORK." | NEW — saved override or new default |
| `design.hero21` | — | "YOUR" | NEW — saved override or new default |
| `design.hero22` | — | "WORLD." | NEW — saved override or new default |
| `design.compare1` | — | "كل رابط يحكي جزءاً من قصتك." | NEW — saved override or new default |
| `design.compare2` | — | "viral" | NEW — saved override or new default |
| `design.compare3` | — | "px" | NEW — saved override or new default |
| `design.compare4` | — | "viralpx.com/your-name" | NEW — saved override or new default |
| `design.features1` | — | "ولأفكارك مساحة أيضاً." | NEW — saved override or new default |
| `design.features2` | — | "انشر مقالاتك وشارك خبراتك من خلال مدونتك الخاصة." | NEW — saved override or new default |
| `design.features3` | — | "https://www.viralpx.com/blog" | NEW — saved override or new default |
| `design.features4` | — | "استكشف المدوّنة" | NEW — saved override or new default |
| `design.showcase1` | — | "أغلفة تصميمية للتعريف بأصحاب المواقع. افتح النموذج لاستكشاف الموقع الفعلي." | NEW — saved override or new default |
| `design.faq1` | — | "إجابات تساعدك على اختيار خطوتك القادمة." | NEW — saved override or new default |
| `design.faq2` | — | "https://wa.me/971558710190" | NEW — saved override or new default |
| `design.faq3` | — | "لديك سؤال آخر؟ تواصل معنا" | NEW — saved override or new default |
| `design.cta1` | — | "30 يوماً مجاناً · دون بطاقة دفع" | NEW — saved override or new default |
| `design.mobile1` | — | "30 يوماً مجاناً" | NEW — saved override or new default |
| `design.mobile2` | — | "https://wa.me/971558710190" | NEW — saved override or new default |
| `design.mobile3` | — | "ابدأ تجربتك" | NEW — saved override or new default |
| `design.studioWorkTitle` | — | "كل أعمالك، بطريقتك." | NEW — saved override or new default |
| `design.studioWorkDesc` | — | "اختَر نوع المحتوى لتشاهد عرض التصاميم والفيديوهات في المعاينة." | NEW — saved override or new default |
| `design.studioOrderTitle` | — | "ابدأ بما يهمّك." | NEW — saved override or new default |
| `design.studioOrderDesc` | — | "ضع نبذتك أولاً، أو افتح موقعك بأعمالك. ترتيب يحكي قصتك." | NEW — saved override or new default |
| `design.studioLight` | — | "جرّب المظهر الفاتح" | NEW — saved override or new default |
| `design.studioWorkFirst` | — | "قدّم الأعمال على النبذة" | NEW — saved override or new default |
| `design.menuOpen` | — | "فتح القائمة" | NEW — saved override or new default |
| `design.menuClose` | — | "إغلاق القائمة" | NEW — saved override or new default |
| `design.blogLabel` | — | "المدوّنة" | NEW — saved override or new default |
| `design.footerIntro` | — | "منصّة للمبدعين.\nومساحة تشبه شغلك." | NEW — saved override or new default |
| `design.footerContact` | — | "لنبقَ على تواصل" | NEW — saved override or new default |
| `design.footerWhatsapp` | — | "تواصل عبر واتساب" | NEW — saved override or new default |
| `design.backTop` | — | "العودة إلى الأعلى" | NEW — saved override or new default |
| `design.playVideo` | — | "شغّل الفيديو" | NEW — saved override or new default |
| `design.closeVideo` | — | "اقفل الفيديو" | NEW — saved override or new default |
| `design.callLabel` | — | "اتصل بينا" | NEW — saved override or new default |
| `design.heroPortraitUrl` | — | "/viralpx-landing/assets/image-11.webp" | NEW — saved override or new default |
| `design.heroPhoneImageUrl` | — | "/viralpx-landing/assets/image-48.webp" | NEW — saved override or new default |
| `design.loginUrl` | — | "/login" | NEW — saved override or new default |
| `design.languageLabel` | — | "EN" | NEW — saved override or new default |
| `design.themeLight` | — | "التبديل إلى المظهر الفاتح" | NEW — saved override or new default |
| `design.themeDark` | — | "التبديل إلى المظهر الداكن" | NEW — saved override or new default |
| `design.compareLabel1` | — | "ملفات" | NEW — saved override or new default |
| `design.compareLabel2` | — | "رابط منفصل" | NEW — saved override or new default |
| `design.compareLabel3` | — | "رابط آخر" | NEW — saved override or new default |
| `design.skipLabel` | — | "انتقل إلى المحتوى" | NEW — saved override or new default |
| `design.menuLabel` | — | "القائمة الرئيسية" | NEW — saved override or new default |
| `design.homeLabel` | — | "ViralPX الرئيسية" | NEW — saved override or new default |
### EN

| Key | Previous default | New reference default | Selection |
|---|---|---|---|
| `nav.showcase` | "Showcase" | "Examples" | Edited saved value/list wins; otherwise new default |
| `nav.compare` | "Why us" | "Why ViralPX?" | Edited saved value/list wins; otherwise new default |
| `ctaUrl` | "/login" | "https://wa.me/971558710190" | Edited saved value/list wins; otherwise new default |
| `tagline` | "SHOW. GROW. WIN." | "" | Edited saved value/list wins; otherwise new default |
| `heroEyebrow` | "Your first month is free" | "One space. All your creativity." | Edited saved value/list wins; otherwise new default |
| `heroTitle` | "Your work deserves a site in your name," | "Your work deserves\na website" | Edited saved value/list wins; otherwise new default |
| `heroTitleAccent` | "not a Drive link." | "with your name on it." | Edited saved value/list wins; otherwise new default |
| `heroSub` | "ViralPX turns your projects, reels and articles into a professional site on your own domain — in Arabic and English, without a line of code. Try it free for a full month, with every feature." | "Bring your projects, photos and videos together in a portfolio that feels like you. Make it your own, and share your work with confidence." | Edited saved value/list wins; otherwise new default |
| `heroTitleBreak` | true | false | Edited saved value/list wins; otherwise new default |
| `heroBtn1` | "Start your free month" | "Request your free trial" | Edited saved value/list wins; otherwise new default |
| `heroBtn2` | "See a real portfolio" | "See the examples" | Edited saved value/list wins; otherwise new default |
| `heroNote` | "No card needed · Every feature unlocked · Cancel anytime" | "30 days free · No card needed" | Edited saved value/list wins; otherwise new default |
| `heroBtn2Url` | "" | "#showcase" | Edited saved value/list wins; otherwise new default |
| `featuresEyebrow` | "Features" | "Details make the difference" | Edited saved value/list wins; otherwise new default |
| `featuresTitle` | "Everything that makes a client say “I want to work with them”" | "Everything your work needs." | Edited saved value/list wins; otherwise new default |
| `featuresSub` | "And you never pay extra for a feature — every plan has all of them." | "" | Edited saved value/list wins; otherwise new default |
| `features[0].icon` | "globe" | "▧" | Edited saved value/list wins; otherwise new default |
| `features[0].t` | "Your own domain" | "Photos, projects and reels" | Edited saved value/list wins; otherwise new default |
| `features[0].d` | "yourname.com instead of a long link — with free, automatic SSL." | "Show your work in its proper format, with project pages and vertical reels that stay uncropped." | Edited saved value/list wins; otherwise new default |
| `features[1].icon` | "palette" | "ع / EN" | Edited saved value/list wins; otherwise new default |
| `features[1].t` | "Design that fits you" | "Your language. Your audience’s language." | Edited saved value/list wins; otherwise new default |
| `features[1].d` | "Your colours, fonts and section order — all from the dashboard." | "A website and dashboard in Arabic and English, with content you write in both." | Edited saved value/list wins; otherwise new default |
| `features[2].icon` | "image" | "Bē" | Edited saved value/list wins; otherwise new default |
| `features[2].t` | "Projects & reels" | "Your work comes with you" | Edited saved value/list wins; otherwise new default |
| `features[2].d` | "A 9:16 reel player, images and highlights — your work shown the way it deserves." | "Import your Behance projects without uploading everything again." | Edited saved value/list wins; otherwise new default |
| `features[3].icon` | "zap" | "◷" | Edited saved value/list wins; otherwise new default |
| `features[3].t` | "Fast, and found on Google" | "Understand your audience" | Edited saved value/list wins; otherwise new default |
| `features[3].d` | "WebP images, a sitemap and structured data — a quick site that is easy to find." | "See where visitors come from and which projects get their attention." | Edited saved value/list wins; otherwise new default |
| `features[4].icon` | "edit" | "“" | Edited saved value/list wins; otherwise new default |
| `features[4].t` | "A blog that builds trust" | "Trust, in your clients’ words" | Edited saved value/list wins; otherwise new default |
| `features[4].d` | "Write articles with SEO ready for each one — and let your expertise speak for you." | "Send clients a review link and approve their feedback before it appears on your site." | Edited saved value/list wins; otherwise new default |
| `features[5].icon` | "mail" | "✉" | Edited saved value/list wins; otherwise new default |
| `features[5].t` | "Clients reach you instantly" | "Make it easy to talk" | Edited saved value/list wins; otherwise new default |
| `features[5].d` | "A contact form that lands straight in your inbox, and a WhatsApp button on your site." | "WhatsApp, phone and a contact form let clients reach you their way." | Edited saved value/list wins; otherwise new default |
| `howEyebrow` | "How it works" | "Simple steps" | Edited saved value/list wins; otherwise new default |
| `howTitle` | "Your site can be ready today" | "From your work," | Edited saved value/list wins; otherwise new default |
| `how[0].n` | "1" | "Connect" | Edited saved value/list wins; otherwise new default |
| `how[0].t` | "Message us on WhatsApp" | "Request your trial" | Edited saved value/list wins; otherwise new default |
| `how[0].d` | "Send us a message and we set up your site, then an email lets you choose your password — no card needed." | "Message us on WhatsApp. We’ll set up your account and email a link to choose your password." | Edited saved value/list wins; otherwise new default |
| `how[1].n` | "2" | "Customise" | Edited saved value/list wins; otherwise new default |
| `how[1].t` | "Add your work" | "Make it yours" | Edited saved value/list wins; otherwise new default |
| `how[1].d` | "Upload your projects, reels and articles, and arrange the sections your way." | "Upload your work or import it from Behance, then choose colours, fonts and section order." | Edited saved value/list wins; otherwise new default |
| `how[2].n` | "3" | "Share" | Edited saved value/list wins; otherwise new default |
| `how[2].t` | "Publish and get clients" | "Send your link" | Edited saved value/list wins; otherwise new default |
| `how[2].d` | "Connect your domain, share your site, and clients contact you directly." | "Share your website with clients: your work, experience and contact details, all together." | Edited saved value/list wins; otherwise new default |
| `howBtn` | "Take the first step" | "" | Edited saved value/list wins; otherwise new default |
| `showcaseTitle` | "Arab creators showing their work on ViralPX" | "One platform." | Edited saved value/list wins; otherwise new default |
| `showcaseSub` | "Open any portfolio and see the exact experience their clients get." | "A space that adapts to designers, photographers, video editors, motion and UI/UX designers, and writers." | Edited saved value/list wins; otherwise new default |
| `visit` | "Visit the site" | "Visit website" | Edited saved value/list wins; otherwise new default |
| `compareEyebrow` | "The difference" | "A complete presence" | Edited saved value/list wins; otherwise new default |
| `compareTitle` | "Clients judge you in the first 5 seconds" | "Fewer links." | Edited saved value/list wins; otherwise new default |
| `compareSub` | "A Drive link says you are still trying things out. A site in your name says you are a professional." | "Give clients a complete experience, from the first project they see to the first message they send." | Edited saved value/list wins; otherwise new default |
| `compareOldTitle` | "A Drive link or a shared platform" | "Work scattered across links" | Edited saved value/list wins; otherwise new default |
| `compareOld[0]` | "The client sees your competitors’ work right next to yours." | "Portfolio.pdf" | Edited saved value/list wins; otherwise new default |
| `compareOld[1]` | "Video stutters and opens at the wrong size." | "Videos" | Edited saved value/list wins; otherwise new default |
| `compareOld[2]` | "A long link without your name — it undercuts your rate." | "About me" | Edited saved value/list wins; otherwise new default |
| `compareOld[3]` | "No quick way for the client to reach you." | — | Edited saved value/list wins; otherwise new default |
| `compareNewTitle` | "A portfolio on ViralPX" | "One link that represents you." | Edited saved value/list wins; otherwise new default |
| `compareNew[0]` | "The whole page is yours — your name, your work, nothing else." | "Every kind of work in one place" | Edited saved value/list wins; otherwise new default |
| `compareNew[1]` | "Reels play fast, in 9:16, on a phone." | "Your experience, services and contact details together" | Edited saved value/list wins; otherwise new default |
| `compareNew[2]` | "A domain in your name — professional from the first moment." | "Colours, fonts and section order you choose" | Edited saved value/list wins; otherwise new default |
| `compareNew[3]` | "A WhatsApp button and a contact form — the client reaches you on the spot." | — | Edited saved value/list wins; otherwise new default |
| `compareLink` | "Try the difference free" | "" | Edited saved value/list wins; otherwise new default |
| `pricingEyebrow` | "Pricing" | "Room to create. A plan that fits." | Edited saved value/list wins; otherwise new default |
| `pricingTitle` | "Try a full month free, then pick what suits you" | "The first month" | Edited saved value/list wins; otherwise new default |
| `pricingSub` | "Every plan includes every feature — the only difference is how you pay." | "Try every feature for 30 days, then choose the subscription that works for you." | Edited saved value/list wins; otherwise new default |
| `plans[0].price` | "199" | "$10" | Edited saved value/list wins; otherwise new default |
| `plans[0].note` | "Full flexibility, no long commitment." | "Subscribe and cancel with flexibility." | Edited saved value/list wins; otherwise new default |
| `plans[0].feats[0]` | "Pay month to month" | "Every feature" | Edited saved value/list wins; otherwise new default |
| `plans[0].feats[1]` | "Cancel anytime" | "Your own ViralPX address" | Edited saved value/list wins; otherwise new default |
| `plans[0].feats[2]` | "Every feature" | "Content and design controls" | Edited saved value/list wins; otherwise new default |
| `plans[0].cta` | "Start your free month" | "Request your free trial" | Edited saved value/list wins; otherwise new default |
| `plans[0].url` | "" | "https://wa.me/971558710190?text=I%20would%20like%20to%20try%20ViralPX%20and%20the%20monthly%20plan" | Edited saved value/list wins; otherwise new default |
| `plans[1].name` | "Yearly" | "Annual" | Edited saved value/list wins; otherwise new default |
| `plans[1].badge` | "Best value" | "Save 25%" | Edited saved value/list wins; otherwise new default |
| `plans[1].price` | "1,990" | "$90" | Edited saved value/list wins; otherwise new default |
| `plans[1].note` | "About 166 a month — two months free" | "A home for your work, all year." | Edited saved value/list wins; otherwise new default |
| `plans[1].feats[0]` | "Two months free every year" | "Every feature" | Edited saved value/list wins; otherwise new default |
| `plans[1].feats[1]` | "Your price stays fixed all year" | "Save over monthly billing" | Edited saved value/list wins; otherwise new default |
| `plans[1].feats[2]` | "Every feature" | "Content and design controls" | Edited saved value/list wins; otherwise new default |
| `plans[1].cta` | "Start your free month" | "Request your free trial" | Edited saved value/list wins; otherwise new default |
| `plans[1].url` | "" | "https://wa.me/971558710190?text=I%20would%20like%20to%20try%20ViralPX%20and%20the%20annual%20plan" | Edited saved value/list wins; otherwise new default |
| `plans[2].name` | "One-time" | "One payment" | Edited saved value/list wins; otherwise new default |
| `plans[2].badge` | "One payment" | "" | Edited saved value/list wins; otherwise new default |
| `plans[2].price` | "4,990" | "$500" | Edited saved value/list wins; otherwise new default |
| `plans[2].per` | "/ once" | "" | Edited saved value/list wins; otherwise new default |
| `plans[2].note` | "Pay once — hosting, every feature and all updates, no subscription." | "No recurring subscription." | Edited saved value/list wins; otherwise new default |
| `plans[2].feats[0]` | "No recurring subscription" | "Every feature" | Edited saved value/list wins; otherwise new default |
| `plans[2].feats[1]` | "All future updates included" | "Hosting and updates" | Edited saved value/list wins; otherwise new default |
| `plans[2].feats[2]` | "Every feature" | "Content and design controls" | Edited saved value/list wins; otherwise new default |
| `plans[2].cta` | "Start your free month" | "Request your free trial" | Edited saved value/list wins; otherwise new default |
| `plans[2].url` | "" | "https://wa.me/971558710190?text=I%20would%20like%20details%20of%20the%20ViralPX%20one-time%20plan" | Edited saved value/list wins; otherwise new default |
| `pricingIncludedTitle` | "In every plan:" | "" | Edited saved value/list wins; otherwise new default |
| `pricingIncluded[0]` | "Custom domain + SSL" | — | Edited saved value/list wins; otherwise new default |
| `pricingIncluded[1]` | "Customisable design" | — | Edited saved value/list wins; otherwise new default |
| `pricingIncluded[2]` | "Projects & 9:16 reels" | — | Edited saved value/list wins; otherwise new default |
| `pricingIncluded[3]` | "Blog with SEO" | — | Edited saved value/list wins; otherwise new default |
| `pricingIncluded[4]` | "Contact form & WhatsApp button" | — | Edited saved value/list wins; otherwise new default |
| `pricingIncluded[5]` | "Arabic & English" | — | Edited saved value/list wins; otherwise new default |
| `pricingIncluded[6]` | "Support" | — | Edited saved value/list wins; otherwise new default |
| `pricingNote` | "First 30 days free on any plan · No card needed" | "Every plan includes the same features. Buying and renewing a custom domain is separate." | Edited saved value/list wins; otherwise new default |
| `faqEyebrow` | "Quick answers" | "Frequently asked questions" | Edited saved value/list wins; otherwise new default |
| `faqTitle` | "Before you start" | "Before you" | Edited saved value/list wins; otherwise new default |
| `faqs[0].q` | "Will clients take me more seriously with a site?" | "Do I need to know how to code?" | Edited saved value/list wins; otherwise new default |
| `faqs[0].a` | "A site in your name, on your own domain, says you work at this rather than trying it out. The client sees your work on its own, with no competitors beside it, and can reach you with one tap on WhatsApp." | "No. Edit your content and design in the dashboard, and drag projects and sections into place." | Edited saved value/list wins; otherwise new default |
| `faqs[1].q` | "What happens after the free month?" | "How do I start my free trial?" | Edited saved value/list wins; otherwise new default |
| `faqs[1].a` | "Before it ends we send you a reminder, and you pick the plan that suits you. If you don’t, your site pauses and your content stays saved." | "Message us on WhatsApp. We’ll set up your account and email you a link to choose your password and get started." | Edited saved value/list wins; otherwise new default |
| `faqs[2].q` | "Do I need a card to try it?" | "What happens after the trial?" | Edited saved value/list wins; otherwise new default |
| `faqs[2].a` | "No. Message us on WhatsApp and we set your site up straight away — you pay nothing until you choose a plan." | "If you want to continue, choose a plan and arrange payment with our team. No card is needed for the trial, and there are no automatic charges." | Edited saved value/list wins; otherwise new default |
| `faqs[3].q` | "What is the difference between the plans?" | "Do I need to buy a domain?" | Edited saved value/list wins; otherwise new default |
| `faqs[3].a` | "Every plan has the same features. Only the payment differs: monthly for flexibility, yearly to save, and one-time if you want no subscription at all." | "No. Use your own address on viralpx.com or connect a domain you own. You handle domain purchase and renewal, including on the one-payment plan." | Edited saved value/list wins; otherwise new default |
| `faqs[4].q` | "What exactly does the one-time plan include?" | "Can I bring my projects from Behance?" | Edited saved value/list wins; otherwise new default |
| `faqs[4].a` | "Hosting, every feature and all future updates, with no subscription. Renewing the domain itself is yours to do, yearly, with the company you bought it from." | "Yes. Import your projects instead of uploading everything again." | Edited saved value/list wins; otherwise new default |
| `faqs[5].q` | "Can I cancel? What happens to my site?" | "Does it support Arabic and English?" | Edited saved value/list wins; otherwise new default |
| `faqs[5].a` | "Yes — change your plan or cancel at any time. If you cancel, your site pauses and your content stays saved; come back and it returns as it was. A domain you bought in your name stays yours." | "Yes. The site and dashboard support both languages. Write your content in Arabic and English so visitors can choose." | Edited saved value/list wins; otherwise new default |
| `faqs[6].q` | "Do I need to know how to code?" | "Does it work on phones?" | Edited saved value/list wins; otherwise new default |
| `faqs[6].a` | "Not at all. You change everything from the dashboard with simple fields and choices, and reorder by dragging." | "Yes. The layout adapts to phones, with proper reel formats and easy-to-reach contact buttons." | Edited saved value/list wins; otherwise new default |
| `faqs[7].q` | "How long until my site is ready?" | "Will it help my site appear in search?" | Edited saved value/list wins; otherwise new default |
| `faqs[7].a` | "If your work is ready, you can publish the same day: the site opens with starter text for your field, and you add your projects, adjust what you like and publish." | "It includes SEO tools such as page titles, descriptions and a sitemap. Visibility and ranking depend on many factors and cannot be guaranteed." | Edited saved value/list wins; otherwise new default |
| `faqs[8].q` | "I have no projects ready yet. Where do I start?" | "What happens if I cancel?" | Edited saved value/list wins; otherwise new default |
| `faqs[8].a` | "Start with what you have — three to five good pieces beat twenty average ones, and personal projects or experiments count. Sections that are still empty are hidden from visitors, so the site looks complete from day one." | "Your website pauses, and your content stays saved for when you return." | Edited saved value/list wins; otherwise new default |
| `faqs[9].q` | "Can I connect my own domain? Who owns it?" | — | Edited saved value/list wins; otherwise new default |
| `faqs[9].a` | "Yes, and SSL switches on automatically. You buy the domain in your own name from any registrar, and it stays yours even if you leave ViralPX. If you don’t have one yet, we walk you through buying it step by step." | — | Edited saved value/list wins; otherwise new default |
| `faqs[10].q` | "Does the site support Arabic and English?" | — | Edited saved value/list wins; otherwise new default |
| `faqs[10].a` | "Yes — the whole site works in both, and visitors switch with one tap." | — | Edited saved value/list wins; otherwise new default |
| `faqs[11].q` | "Is my data safe?" | — | Edited saved value/list wins; otherwise new default |
| `faqs[11].a` | "The site runs on HTTPS, and your data is backed up every 6 hours to separate storage." | — | Edited saved value/list wins; otherwise new default |
| `ctaTitle` | "Your work is ready. It just needs a site worthy of it." | "Give your work\nthe space" | Edited saved value/list wins; otherwise new default |
| `ctaSub` | "Start your free month today — every feature unlocked, no card needed." | "Start your trial and give your work an address of its own." | Edited saved value/list wins; otherwise new default |
| `ctaBtn` | "Start your free month" | "Request your free trial" | Edited saved value/list wins; otherwise new default |
| `footerNote` | "A portfolio platform for Arabic designers and creators." | "Show your work under your own name, make your website your own, and make it easier to get in touch." | Edited saved value/list wins; otherwise new default |
| `footerGroups[0].title` | "The site" | "Explore" | Edited saved value/list wins; otherwise new default |
| `footerGroups[0].links[1].label` | "Showcase" | "Examples" | Edited saved value/list wins; otherwise new default |
| `footerGroups[1].links[0].label` | "Why us" | "Why ViralPX?" | Edited saved value/list wins; otherwise new default |
| `footerGroups[1].links[1].label` | "FAQ" | "Frequently asked questions" | Edited saved value/list wins; otherwise new default |
| `waNumber` | "" | "971558710190" | Edited saved value/list wins; otherwise new default |
| `phone` | "" | "+971 55 871 0190" | Edited saved value/list wins; otherwise new default |
| `pricingIncluded` | — | [] | NEW — saved override or new default |
| `compareAccent` | — | "A clearer picture of you." | NEW — saved override or new default |
| `featuresAccent` | — | "Right where it belongs." | NEW — saved override or new default |
| `showcaseAccent` | — | "Different personalities." | NEW — saved override or new default |
| `howAccent` | — | "to your website." | NEW — saved override or new default |
| `pricingAccent` | — | "is on us." | NEW — saved override or new default |
| `faqAccent` | — | "begin." | NEW — saved override or new default |
| `ctaAccent` | — | "it deserves." | NEW — saved override or new default |
| `design.ctaEyebrow` | — | "Your work is ready" | NEW — saved override or new default |
| `design.pricingPaymentNote` | — | "No card needed for the trial · Arrange your subscription and payment with our team on WhatsApp" | NEW — saved override or new default |
| `design.studio1` | — | "Your space, your call" | NEW — saved override or new default |
| `design.studio2` | — | "Your website." | NEW — saved override or new default |
| `design.studio3` | — | "Your way." | NEW — saved override or new default |
| `design.studio4` | — | "Edit your content, choose your colours and arrange your sections." | NEW — saved override or new default |
| `design.studio5` | — | "No code. No waiting on anyone." | NEW — saved override or new default |
| `design.studio6` | — | "Explore the dashboard" | NEW — saved override or new default |
| `design.studio7` | — | "Your colours and identity" | NEW — saved override or new default |
| `design.studio8` | — | "Your projects and content" | NEW — saved override or new default |
| `design.studio9` | — | "Your sections and order" | NEW — saved override or new default |
| `design.studio10` | — | "Interactive preview" | NEW — saved override or new default |
| `design.studio11` | — | "A colour that feels like you." | NEW — saved override or new default |
| `design.studio12` | — | "Try a palette and watch your site take on a new identity." | NEW — saved override or new default |
| `design.studio13` | — | "Preview colour" | NEW — saved override or new default |
| `design.studio14` | — | "Warm orange" | NEW — saved override or new default |
| `design.studio15` | — | "Purple" | NEW — saved override or new default |
| `design.studio16` | — | "Green" | NEW — saved override or new default |
| `design.studio17` | — | "Try dark mode" | NEW — saved override or new default |
| `design.studio18` | — | "Type of work" | NEW — saved override or new default |
| `design.studio19` | — | "All" | NEW — saved override or new default |
| `design.studio20` | — | "Design" | NEW — saved override or new default |
| `design.studio21` | — | "Video" | NEW — saved override or new default |
| `design.studio22` | — | "Move about above work" | NEW — saved override or new default |
| `design.studio23` | — | "Try a different section order in this preview." | NEW — saved override or new default |
| `design.studio24` | — | "your-portfolio.viralpx.com" | NEW — saved override or new default |
| `design.studio25` | — | "M" | NEW — saved override or new default |
| `design.studio26` | — | "A space for your creativity." | NEW — saved override or new default |
| `design.studio27` | — | "Designer. Maker. Full of ideas." | NEW — saved override or new default |
| `design.studio28` | — | "Let’s talk" | NEW — saved override or new default |
| `design.studio29` | — | "VISUAL" | NEW — saved override or new default |
| `design.studio30` | — | "STORIES." | NEW — saved override or new default |
| `design.studio31` | — | "Brand identity" | NEW — saved override or new default |
| `design.studio32` | — | "Ideas" | NEW — saved override or new default |
| `design.studio33` | — | "made visible." | NEW — saved override or new default |
| `design.studio34` | — | "Advertising design" | NEW — saved override or new default |
| `design.studio35` | — | "Stories in motion" | NEW — saved override or new default |
| `design.studio36` | — | "Reels and video" | NEW — saved override or new default |
| `design.studio37` | — | "About me" | NEW — saved override or new default |
| `design.studio38` | — | "I turn ideas into visual experiences with a story to tell." | NEW — saved override or new default |
| `design.studio39` | — | "This is a demo of customisation. Manage your actual site from your ViralPX account." | NEW — saved override or new default |
| `design.hero1` | — | "An example of your portfolio layout" | NEW — saved override or new default |
| `design.hero2` | — | "viralpx.com / you" | NEW — saved override or new default |
| `design.hero3` | — | "am®" | NEW — saved override or new default |
| `design.hero4` | — | "My work · About me · Let’s talk" | NEW — saved override or new default |
| `design.hero5` | — | "Design that stands out." | NEW — saved override or new default |
| `design.hero6` | — | "Ideas that work." | NEW — saved override or new default |
| `design.hero7` | — | "Ahmed Mahmoud" | NEW — saved override or new default |
| `design.hero8` | — | "Brand identity" | NEW — saved override or new default |
| `design.hero9` | — | "FORM" | NEW — saved override or new default |
| `design.hero10` | — | "STUDIO." | NEW — saved override or new default |
| `design.hero11` | — | "The art of detail" | NEW — saved override or new default |
| `design.hero12` | — | "An idea." | NEW — saved override or new default |
| `design.hero13` | — | "A lasting impression." | NEW — saved override or new default |
| `design.hero14` | — | "MAKE" | NEW — saved override or new default |
| `design.hero15` | — | "IT MOVE." | NEW — saved override or new default |
| `design.hero16` | — | "Motion graphics" | NEW — saved override or new default |
| `design.hero17` | — | "Every detail, unmistakably you." | NEW — saved override or new default |
| `design.hero18` | — | "Your colours · Your work · Your style" | NEW — saved override or new default |
| `design.hero19` | — | "YOUR" | NEW — saved override or new default |
| `design.hero20` | — | "WORK." | NEW — saved override or new default |
| `design.hero21` | — | "YOUR" | NEW — saved override or new default |
| `design.hero22` | — | "WORLD." | NEW — saved override or new default |
| `design.compare1` | — | "Every link tells only part of your story." | NEW — saved override or new default |
| `design.compare2` | — | "viral" | NEW — saved override or new default |
| `design.compare3` | — | "px" | NEW — saved override or new default |
| `design.compare4` | — | "viralpx.com/your-name" | NEW — saved override or new default |
| `design.features1` | — | "Room for your ideas, too." | NEW — saved override or new default |
| `design.features2` | — | "Publish articles and share what you know on your own blog." | NEW — saved override or new default |
| `design.features3` | — | "https://www.viralpx.com/blog" | NEW — saved override or new default |
| `design.features4` | — | "Explore the blog" | NEW — saved override or new default |
| `design.showcase1` | — | "Visual introductions to the people behind these sites. Open a portfolio to see the real experience." | NEW — saved override or new default |
| `design.faq1` | — | "Answers to help you take your next step." | NEW — saved override or new default |
| `design.faq2` | — | "https://wa.me/971558710190" | NEW — saved override or new default |
| `design.faq3` | — | "Another question? Let’s talk" | NEW — saved override or new default |
| `design.cta1` | — | "30 days free · No card needed" | NEW — saved override or new default |
| `design.mobile1` | — | "30 days free" | NEW — saved override or new default |
| `design.mobile2` | — | "https://wa.me/971558710190" | NEW — saved override or new default |
| `design.mobile3` | — | "Start your trial" | NEW — saved override or new default |
| `design.studioWorkTitle` | — | "All your work, your way." | NEW — saved override or new default |
| `design.studioWorkDesc` | — | "Choose a content type to see designs and videos in the preview." | NEW — saved override or new default |
| `design.studioOrderTitle` | — | "Lead with what matters." | NEW — saved override or new default |
| `design.studioOrderDesc` | — | "Introduce yourself first, or let your work do the talking. Arrange your story your way." | NEW — saved override or new default |
| `design.studioLight` | — | "Try light mode" | NEW — saved override or new default |
| `design.studioWorkFirst` | — | "Move work above about" | NEW — saved override or new default |
| `design.menuOpen` | — | "Open menu" | NEW — saved override or new default |
| `design.menuClose` | — | "Close menu" | NEW — saved override or new default |
| `design.blogLabel` | — | "Blog" | NEW — saved override or new default |
| `design.footerIntro` | — | "A platform for creatives.\nA space that feels like your work." | NEW — saved override or new default |
| `design.footerContact` | — | "Let’s stay in touch" | NEW — saved override or new default |
| `design.footerWhatsapp` | — | "Chat on WhatsApp" | NEW — saved override or new default |
| `design.backTop` | — | "Back to top" | NEW — saved override or new default |
| `design.playVideo` | — | "Play video" | NEW — saved override or new default |
| `design.closeVideo` | — | "Close video" | NEW — saved override or new default |
| `design.callLabel` | — | "Call us" | NEW — saved override or new default |
| `design.heroPortraitUrl` | — | "/viralpx-landing/assets/image-11.webp" | NEW — saved override or new default |
| `design.heroPhoneImageUrl` | — | "/viralpx-landing/assets/image-48.webp" | NEW — saved override or new default |
| `design.loginUrl` | — | "/login" | NEW — saved override or new default |
| `design.languageLabel` | — | "ع" | NEW — saved override or new default |
| `design.themeLight` | — | "Switch to light mode" | NEW — saved override or new default |
| `design.themeDark` | — | "Switch to dark mode" | NEW — saved override or new default |
| `design.compareLabel1` | — | "Files" | NEW — saved override or new default |
| `design.compareLabel2` | — | "Separate link" | NEW — saved override or new default |
| `design.compareLabel3` | — | "Another link" | NEW — saved override or new default |
| `design.skipLabel` | — | "Skip to content" | NEW — saved override or new default |
| `design.menuLabel` | — | "Main navigation" | NEW — saved override or new default |
| `design.homeLabel` | — | "ViralPX home" | NEW — saved override or new default |
