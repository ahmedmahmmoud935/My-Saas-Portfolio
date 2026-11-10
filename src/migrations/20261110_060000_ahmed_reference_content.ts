import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/*
 * Ahmed's portfolio gets the reference's programming projects and two more
 * services, at the owner's request (2026-11-10).
 *
 * Products: ViralPX (drawn as a website), the iEnglish landing page (drawn as
 * a landing page with the iEnglish campaign picture) and the branch analytics
 * dashboard (the demo dashboard) — the reference's own words in both
 * languages. ViralPX leads; the Imtiaz & Partners site follows it.
 *
 * Services: "Website design & development" and "Systems & dashboards".
 *
 * Each is added once: a product with the same name, or a service with the
 * same title, already there is left as it is. All of it is editable from the
 * dashboard afterwards.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    DECLARE t integer; s integer; p integer; cover integer; n integer;
    BEGIN
      SELECT id INTO t FROM tenants WHERE slug = 'ahmed' LIMIT 1;
      IF t IS NULL THEN RETURN; END IF;

      -- ── Products ──────────────────────────────────────────────────────
      IF NOT EXISTS (SELECT 1 FROM products pr JOIN products_locales l ON l._parent_id = pr.id
                     WHERE pr.tenant_id = t AND l.title = 'ViralPX') THEN
        UPDATE products SET sort_order = sort_order + 1 WHERE tenant_id = t;
        INSERT INTO products (tenant_id, url, preview, mock_brand, sort_order)
          VALUES (t, 'https://www.viralpx.com', 'site', 'viralpx', 0) RETURNING id INTO p;
        INSERT INTO products_locales (_locale, _parent_id, title, tag, description, details, btn_label, mock_tagline, mock_headline) VALUES
          ('ar', p, 'ViralPX', 'منتج شخصي',
           'منصة بورتفوليو للمصممين وصنّاع الفيديو؛ تجمع المشاريع والريلز والمعلومات المهنية في موقع شخصي واحد.',
           E'تخصيص الأقسام والألوان والخطوط\\nإدارة المشاريع والفيديوهات من لوحة تحكّم\\nتجربة عرض بالعربية والإنجليزية',
           'استكشف ViralPX', 'مساحة تشبه شغلك', E'شغلك يستاهل\\nموقع باسمك.'),
          ('en', p, 'ViralPX', 'Personal product',
           'A portfolio platform for designers and video creators. Bringing projects, reels and professional information into one personal website.',
           E'Flexible sections, colours and typography\\nProject and video management from a dashboard\\nArabic and English portfolio experiences',
           'Explore ViralPX', 'A space for your work', E'Good work deserves\\na great portfolio.');
      END IF;

      IF NOT EXISTS (SELECT 1 FROM products pr JOIN products_locales l ON l._parent_id = pr.id
                     WHERE pr.tenant_id = t AND l.title LIKE 'iEnglish%') THEN
        SELECT pj.cover_id INTO cover FROM projects pj JOIN projects_locales l ON l._parent_id = pj.id
          WHERE pj.tenant_id = t AND pj.cover_id IS NOT NULL
            AND (l.title LIKE '%٢٠%' OR l.title LIKE '%20%')
          ORDER BY pj.id LIMIT 1;
        SELECT coalesce(max(sort_order), 0) + 1 INTO n FROM products WHERE tenant_id = t;
        INSERT INTO products (tenant_id, image_id, preview, mock_brand, sort_order)
          VALUES (t, cover, 'landing', 'iEnglish', n) RETURNING id INTO p;
        INSERT INTO products_locales (_locale, _parent_id, title, tag, description, details, details_label, mock_tagline, mock_headline, mock_cta) VALUES
          ('ar', p, 'iEnglish · خطوة أولى أوضح', 'تصميم صفحة هبوط',
           'تصميم صفحة للحملات الإعلانية يعرض البرامج والمدرّسين والتقييمات، ويجعل الوصول إلى نموذج الاستفسار واضحاً على الهاتف.',
           'تبدأ الصفحة برسالة مركّزة ثم نموذج تواصل، وتعرض المعلومات التي يحتاجها الزائر لاختيار البرنامج، مع إبراز الاتصال وواتساب أثناء التصفّح.',
           'تفاصيل الفكرة', 'تعلّم. تحدّث. انطلق.', E'خطوتك القادمة\\nتبدأ بكلمة.', 'تواصل معنا'),
          ('en', p, 'iEnglish · a clearer first step', 'Landing page design',
           'A campaign landing page concept that brings programmes, teachers and reviews together, with an easy route to enquiry on mobile.',
           'The page starts with a focused message, followed by a contact form and useful information for choosing a programme. The design includes prominent call and WhatsApp actions.',
           'Explore the approach', 'Learn. Speak. Grow.', E'Your next step\\nstarts with a word.', 'Get in touch');
      END IF;

      IF NOT EXISTS (SELECT 1 FROM products pr JOIN products_locales l ON l._parent_id = pr.id
                     WHERE pr.tenant_id = t AND l.title = 'لوحة تحليل أداء الفروع') THEN
        SELECT coalesce(max(sort_order), 0) + 1 INTO n FROM products WHERE tenant_id = t;
        INSERT INTO products (tenant_id, preview, mock_brand, sort_order)
          VALUES (t, 'chart', 'نظرة على الفروع', n) RETURNING id INTO p;
        INSERT INTO products_locales (_locale, _parent_id, title, tag, description, details, details_label) VALUES
          ('ar', p, 'لوحة تحليل أداء الفروع', 'نموذج تصوّري',
           'تصوّر لنظام يحوّل ملفات بيانات الفروع إلى مقارنات واضحة للتسجيلات والدورات والمبيعات عبر الفترات.',
           'يبدأ التصوّر باستيراد ملف بيانات، ثم التصفية حسب الفرع والفترة ومقارنة النتائج وتصدير تقرير. المعاينة هنا توضح فكرة الواجهة باستخدام بيانات تجريبية.',
           'تفاصيل التصوّر'),
          ('en', p, 'Branch analytics dashboard', 'Concept prototype',
           'A dashboard concept for turning branch spreadsheets into clear comparisons of enrolment, courses and sales over time.',
           'The proposed workflow starts with importing a spreadsheet, then filtering by branch and period, comparing results and exporting a report. This preview demonstrates the interface using sample data.',
           'Explore the concept');
      END IF;

      -- ── Services ──────────────────────────────────────────────────────
      SELECT id INTO s FROM site_settings WHERE tenant_id = t LIMIT 1;
      IF s IS NULL THEN RETURN; END IF;

      IF NOT EXISTS (SELECT 1 FROM site_settings_content_expertise_items i
                     JOIN site_settings_content_expertise_items_locales l ON l._parent_id = i.id
                     WHERE i._parent_id = s AND l.title LIKE '%المواقع%') THEN
        SELECT coalesce(max(_order), 0) + 1 INTO n FROM site_settings_content_expertise_items WHERE _parent_id = s;
        INSERT INTO site_settings_content_expertise_items (_order, _parent_id, id) VALUES (n, s, 'svc-web-' || s);
        INSERT INTO site_settings_content_expertise_items_locales (title, description, _locale, _parent_id) VALUES
          ('تصميم وتطوير المواقع', 'مواقع تعريفية وبورتفوليو وصفحات هبوط، بتجربة واضحة على الهاتف ولوحة لإدارة المحتوى عند الحاجة.', 'ar', 'svc-web-' || s),
          ('Website design & development', 'Company sites, portfolios and landing pages that work clearly on a phone, with a dashboard to manage the content when you need one.', 'en', 'svc-web-' || s);
      END IF;

      IF NOT EXISTS (SELECT 1 FROM site_settings_content_expertise_items i
                     JOIN site_settings_content_expertise_items_locales l ON l._parent_id = i.id
                     WHERE i._parent_id = s AND (l.title LIKE '%أنظمة%' OR l.title LIKE '%لوحات%')) THEN
        SELECT coalesce(max(_order), 0) + 1 INTO n FROM site_settings_content_expertise_items WHERE _parent_id = s;
        INSERT INTO site_settings_content_expertise_items (_order, _parent_id, id) VALUES (n, s, 'svc-sys-' || s);
        INSERT INTO site_settings_content_expertise_items_locales (title, description, _locale, _parent_id) VALUES
          ('أنظمة ولوحات تحكّم', 'تحويل خطوات العمل المتكررة إلى واجهات لإدارة البيانات والمستخدمين والتقارير، حسب احتياج مشروعك.', 'ar', 'svc-sys-' || s),
          ('Systems & dashboards', 'Turning repetitive work into interfaces for managing data, users and reports, shaped around what your project needs.', 'en', 'svc-sys-' || s);
      END IF;
    END $$;`)
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // Content, not structure: removed from the dashboard if unwanted.
}
