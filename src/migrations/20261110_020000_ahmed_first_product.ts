import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/*
 * The first "Beyond the image" card on ahmed's portfolio, added at the
 * owner's request (2026-11-10): the Imtiaz & Partners site. Its picture comes
 * from the site's own share image until one is uploaded. Added once — if a
 * card with this link already exists, nothing happens — and editable from
 * the dashboard like any other.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    DECLARE t integer; p integer;
    BEGIN
      SELECT id INTO t FROM tenants WHERE slug = 'ahmed' LIMIT 1;
      IF t IS NULL THEN RETURN; END IF;
      IF EXISTS (SELECT 1 FROM products WHERE tenant_id = t AND url ILIKE '%imtiazlaw.ae%') THEN RETURN; END IF;

      INSERT INTO products (tenant_id, url, preview_image, sort_order)
        VALUES (t, 'https://imtiazlaw.ae', 'https://imtiazlaw.ae/og?locale=ar&page=home&v=2', 0)
        RETURNING id INTO p;

      INSERT INTO products_locales (_locale, _parent_id, title, tag, description, btn_label) VALUES
        ('ar', p, 'امتياز ومشاركوه للاستشارات القانونية', 'موقع شركة',
         'موقع لمكتب استشارات قانونية في الإمارات، يعرض خدماته للأفراد والشركات ويوصّل الزائر لحجز استشارة بسهولة.', 'زور الموقع'),
        ('en', p, 'Imtiaz & Partners Legal Consultancy', 'Company website',
         'A site for a UAE legal consultancy that presents its services to individuals and companies and makes booking a consultation easy.', 'Visit the site');
    END $$;`)
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // Content, not structure: removed from the dashboard if unwanted.
}
