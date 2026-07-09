import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum_projects_blocks_text_text_type" AS ENUM('h1', 'h2', 'p');
  CREATE TYPE "public"."enum_projects_blocks_separator_spacing" AS ENUM('compact', 'normal', 'large');
  CREATE TYPE "public"."enum_projects_media_type" AS ENUM('image', 'video');
  CREATE TYPE "public"."enum_projects_project_type" AS ENUM('grid', 'free', 'stacked');
  CREATE TYPE "public"."enum_projects_video_kind" AS ENUM('reel', 'video');
  CREATE TYPE "public"."enum_articles_mode" AS ENUM('richtext', 'html');
  CREATE TYPE "public"."enum_testimonials_source" AS ENUM('admin', 'public');
  CREATE TYPE "public"."enum_visits_device" AS ENUM('desktop', 'mobile', 'tablet');
  CREATE TYPE "public"."enum_site_settings_social_visible" AS ENUM('whatsapp', 'behance', 'instagram', 'linkedin', 'facebook', 'vimeo');
  CREATE TYPE "public"."enum_site_settings_sections_section_id" AS ENUM('hero', 'about', 'projects', 'achievements', 'expertise', 'testimonials', 'logos', 'experience', 'tools', 'education', 'skills', 'contact');
  CREATE TYPE "public"."enum_site_settings_mobile_bar_buttons_pos" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_site_settings_mobile_bar_buttons_type" AS ENUM('section', 'whatsapp', 'articles', 'link');
  CREATE TYPE "public"."enum_site_settings_highlights_items_type" AS ENUM('image', 'video');
  CREATE TYPE "public"."enum_site_settings_background_preset" AS ENUM('dark', 'ocean', 'sunset', 'forest', 'mono', 'pearl');
  CREATE TYPE "public"."enum_site_settings_background_type" AS ENUM('solid', 'gradient');
  CREATE TYPE "public"."enum_site_settings_style_theme" AS ENUM('default', 'kinetic');
  CREATE TYPE "public"."enum_site_settings_style_hero" AS ENUM('centered', 'split', 'massive', 'cover-full', 'minimal');
  CREATE TYPE "public"."enum_site_settings_style_about" AS ENUM('classic', 'visual', 'simple');
  CREATE TYPE "public"."enum_site_settings_style_projects" AS ENUM('grid', 'masonry', 'list', 'freegrid');
  CREATE TYPE "public"."enum_site_settings_style_contact" AS ENUM('classic', 'split');
  CREATE TYPE "public"."enum_site_settings_style_skills" AS ENUM('tags', 'inline', 'bars');
  CREATE TYPE "public"."enum_site_settings_style_tools" AS ENUM('classic', 'compact');
  CREATE TYPE "public"."enum_site_settings_style_exp" AS ENUM('classic', 'timeline');
  CREATE TYPE "public"."enum_site_settings_style_font" AS ENUM('default', 'modern', 'editorial', 'elegant', 'bold');
  CREATE TYPE "public"."enum_site_settings_style_direction" AS ENUM('auto', 'rtl', 'ltr');
  CREATE TYPE "public"."enum_site_settings_style_cursor" AS ENUM('default', 'dot-ring');
  CREATE TYPE "public"."enum_site_settings_style_anim" AS ENUM('fade-up', 'fade', 'none');
  CREATE TYPE "public"."enum_site_settings_theme_config_components_card" AS ENUM('solid', 'glass', 'outline');
  CREATE TYPE "public"."enum_site_settings_theme_config_components_navbar" AS ENUM('blur', 'solid', 'transparent');
  CREATE TYPE "public"."enum_site_settings_theme_config_components_button" AS ENUM('rounded', 'sharp', 'pill');
  CREATE TABLE "users_tenants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tenant_id" integer NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"is_owner" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "tenants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"domain" varchar,
  	"storage_limit_mb" numeric DEFAULT 500,
  	"storage_used_mb" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "projects_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "projects_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text_type" "enum_projects_blocks_text_text_type" DEFAULT 'p',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_text_locales" (
  	"value" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "projects_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src_id" integer NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src_id" integer NOT NULL
  );
  
  CREATE TABLE "projects_blocks_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"embed_url" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_beforeafter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"before_id" integer NOT NULL,
  	"after_id" integer NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_beforeafter_locales" (
  	"label_before" varchar,
  	"label_after" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "projects_blocks_separator" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"spacing" "enum_projects_blocks_separator_spacing" DEFAULT 'normal',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"category" varchar,
  	"media_type" "enum_projects_media_type" DEFAULT 'image' NOT NULL,
  	"project_type" "enum_projects_project_type" DEFAULT 'grid' NOT NULL,
  	"cover_id" integer,
  	"video_url" varchar,
  	"video_kind" "enum_projects_video_kind" DEFAULT 'reel',
  	"aspect_ratio" varchar DEFAULT '9:16',
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "projects_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "articles_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"slug" varchar NOT NULL,
  	"cover_id" integer,
  	"mode" "enum_articles_mode" DEFAULT 'richtext',
  	"published" boolean DEFAULT false,
  	"read_min" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "articles_locales" (
  	"title" varchar NOT NULL,
  	"excerpt" varchar,
  	"content" jsonb,
  	"content_html" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "logos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"name" varchar NOT NULL,
  	"logo_id" integer NOT NULL,
  	"website_url" varchar,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"name" varchar NOT NULL,
  	"company" varchar,
  	"avatar_id" integer,
  	"rating" numeric DEFAULT 5,
  	"source" "enum_testimonials_source" DEFAULT 'admin',
  	"approved" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "testimonials_locales" (
  	"role" varchar,
  	"content" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "achievements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"value" varchar NOT NULL,
  	"icon_id" integer,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "achievements_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "visits" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"visitor_id" varchar,
  	"page" varchar,
  	"project_id" integer,
  	"country" varchar,
  	"device" "enum_visits_device",
  	"referrer" varchar,
  	"visited_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_social_visible" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_site_settings_social_visible",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "site_settings_categories_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "site_settings_categories_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "site_settings_navbar_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_id" varchar NOT NULL,
  	"visible" boolean DEFAULT true
  );
  
  CREATE TABLE "site_settings_navbar_links_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section_id" "enum_site_settings_sections_section_id" NOT NULL,
  	"visible" boolean DEFAULT true,
  	"order" numeric
  );
  
  CREATE TABLE "site_settings_sections_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_mobile_bar_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pos" "enum_site_settings_mobile_bar_buttons_pos",
  	"type" "enum_site_settings_mobile_bar_buttons_type",
  	"target" varchar,
  	"icon" varchar
  );
  
  CREATE TABLE "site_settings_mobile_bar_buttons_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_highlights_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_site_settings_highlights_items_type" DEFAULT 'image',
  	"media_id" integer NOT NULL
  );
  
  CREATE TABLE "site_settings_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"cover_id" integer
  );
  
  CREATE TABLE "site_settings_highlights_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_content_expertise_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon_id" integer
  );
  
  CREATE TABLE "site_settings_content_expertise_items_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_content_experience_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"company" varchar,
  	"period" varchar
  );
  
  CREATE TABLE "site_settings_content_experience_items_locales" (
  	"role" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_content_education_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"period" varchar
  );
  
  CREATE TABLE "site_settings_content_education_items_locales" (
  	"title" varchar,
  	"org" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_content_tools_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"icon_id" integer
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"site_name" varchar,
  	"social_whatsapp" varchar,
  	"social_behance" varchar,
  	"social_instagram" varchar,
  	"social_linkedin" varchar,
  	"social_facebook" varchar,
  	"social_vimeo" varchar,
  	"brand_photo_id" integer,
  	"brand_avatar_id" integer,
  	"brand_hero_cover_id" integer,
  	"brand_brand_logo_id" integer,
  	"brand_favicon_id" integer,
  	"brand_brand_logo_scale" numeric DEFAULT 1,
  	"brand_brand_logo_offset_x" numeric DEFAULT 0,
  	"brand_brand_logo_offset_y" numeric DEFAULT 0,
  	"hero_cover_size" varchar DEFAULT 'cover',
  	"hero_cover_pos_x" numeric DEFAULT 50,
  	"hero_cover_pos_y" numeric DEFAULT 50,
  	"hero_cover_overlay" numeric DEFAULT 0,
  	"hero_cover_height" numeric DEFAULT 85,
  	"colors_accent" varchar DEFAULT '#F97316',
  	"colors_bg" varchar DEFAULT '#0A0A0A',
  	"colors_bg2" varchar DEFAULT '#111111',
  	"colors_text" varchar DEFAULT '#FFFFFF',
  	"colors_subtext" varchar DEFAULT '#999999',
  	"background_preset" "enum_site_settings_background_preset" DEFAULT 'dark',
  	"background_type" "enum_site_settings_background_type" DEFAULT 'solid',
  	"background_color1" varchar,
  	"background_color2" varchar,
  	"style_theme" "enum_site_settings_style_theme" DEFAULT 'default',
  	"style_hero" "enum_site_settings_style_hero" DEFAULT 'centered',
  	"style_about" "enum_site_settings_style_about" DEFAULT 'classic',
  	"style_projects" "enum_site_settings_style_projects" DEFAULT 'grid',
  	"style_contact" "enum_site_settings_style_contact" DEFAULT 'classic',
  	"style_skills" "enum_site_settings_style_skills" DEFAULT 'tags',
  	"style_tools" "enum_site_settings_style_tools" DEFAULT 'classic',
  	"style_exp" "enum_site_settings_style_exp" DEFAULT 'classic',
  	"style_font" "enum_site_settings_style_font" DEFAULT 'default',
  	"style_direction" "enum_site_settings_style_direction" DEFAULT 'auto',
  	"style_cursor" "enum_site_settings_style_cursor" DEFAULT 'default',
  	"style_anim" "enum_site_settings_style_anim" DEFAULT 'fade-up',
  	"theme_config_components_card" "enum_site_settings_theme_config_components_card" DEFAULT 'solid',
  	"theme_config_components_navbar" "enum_site_settings_theme_config_components_navbar" DEFAULT 'blur',
  	"theme_config_components_button" "enum_site_settings_theme_config_components_button" DEFAULT 'rounded',
  	"theme_config_tokens" jsonb,
  	"footer_logo_size" numeric,
  	"footer_logo_align" varchar,
  	"footer_socials_align" varchar,
  	"footer_copy_align" varchar,
  	"theme_overrides" jsonb,
  	"grid_cols_image_mobile" numeric DEFAULT 2,
  	"grid_cols_image_tablet" numeric DEFAULT 3,
  	"grid_cols_image_desktop" numeric DEFAULT 4,
  	"grid_cols_video_mobile" numeric DEFAULT 2,
  	"grid_cols_video_tablet" numeric DEFAULT 3,
  	"grid_cols_video_desktop" numeric DEFAULT 4,
  	"grid_cols_freegrid_mobile" numeric DEFAULT 1,
  	"grid_cols_freegrid_desktop" numeric DEFAULT 2,
  	"proj_tabs_designs_visible" boolean DEFAULT true,
  	"proj_tabs_designs_icon" varchar,
  	"proj_tabs_reels_visible" boolean DEFAULT true,
  	"proj_tabs_reels_icon" varchar,
  	"proj_tabs_videos_visible" boolean DEFAULT true,
  	"proj_tabs_videos_icon" varchar,
  	"mobile_bar_enabled" boolean DEFAULT true,
  	"content_contact_email" varchar,
  	"content_contact_phone" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_locales" (
  	"proj_tabs_designs_label" varchar,
  	"proj_tabs_reels_label" varchar,
  	"proj_tabs_videos_label" varchar,
  	"content_hero_name" varchar,
  	"content_hero_title" varchar,
  	"content_hero_btn1" varchar,
  	"content_hero_btn2" varchar,
  	"content_about_text" varchar,
  	"content_about_tags" varchar,
  	"content_expertise_title" varchar,
  	"content_skills_items" varchar,
  	"content_projects_title" varchar,
  	"content_projects_subtitle" varchar,
  	"content_contact_title" varchar,
  	"content_contact_subtitle" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"tenants_id" integer,
  	"media_id" integer,
  	"projects_id" integer,
  	"articles_id" integer,
  	"logos_id" integer,
  	"testimonials_id" integer,
  	"achievements_id" integer,
  	"visits_id" integer,
  	"site_settings_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_tenants" ADD CONSTRAINT "users_tenants_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_tenants" ADD CONSTRAINT "users_tenants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_images" ADD CONSTRAINT "projects_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_images" ADD CONSTRAINT "projects_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_text" ADD CONSTRAINT "projects_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_text_locales" ADD CONSTRAINT "projects_blocks_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_image" ADD CONSTRAINT "projects_blocks_image_src_id_media_id_fk" FOREIGN KEY ("src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_image" ADD CONSTRAINT "projects_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_grid_items" ADD CONSTRAINT "projects_blocks_grid_items_src_id_media_id_fk" FOREIGN KEY ("src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_grid_items" ADD CONSTRAINT "projects_blocks_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_grid" ADD CONSTRAINT "projects_blocks_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_video" ADD CONSTRAINT "projects_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_beforeafter" ADD CONSTRAINT "projects_blocks_beforeafter_before_id_media_id_fk" FOREIGN KEY ("before_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_beforeafter" ADD CONSTRAINT "projects_blocks_beforeafter_after_id_media_id_fk" FOREIGN KEY ("after_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_beforeafter" ADD CONSTRAINT "projects_blocks_beforeafter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_beforeafter_locales" ADD CONSTRAINT "projects_blocks_beforeafter_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_beforeafter"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_separator" ADD CONSTRAINT "projects_blocks_separator_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_tags" ADD CONSTRAINT "articles_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_locales" ADD CONSTRAINT "articles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "logos" ADD CONSTRAINT "logos_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "logos" ADD CONSTRAINT "logos_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials_locales" ADD CONSTRAINT "testimonials_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "achievements" ADD CONSTRAINT "achievements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "achievements" ADD CONSTRAINT "achievements_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "achievements_locales" ADD CONSTRAINT "achievements_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "visits" ADD CONSTRAINT "visits_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "visits" ADD CONSTRAINT "visits_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_social_visible" ADD CONSTRAINT "site_settings_social_visible_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_categories_image" ADD CONSTRAINT "site_settings_categories_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_categories_video" ADD CONSTRAINT "site_settings_categories_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_navbar_links" ADD CONSTRAINT "site_settings_navbar_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_navbar_links_locales" ADD CONSTRAINT "site_settings_navbar_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_navbar_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_sections" ADD CONSTRAINT "site_settings_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_sections_locales" ADD CONSTRAINT "site_settings_sections_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_mobile_bar_buttons" ADD CONSTRAINT "site_settings_mobile_bar_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_mobile_bar_buttons_locales" ADD CONSTRAINT "site_settings_mobile_bar_buttons_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_mobile_bar_buttons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_highlights_items" ADD CONSTRAINT "site_settings_highlights_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_highlights_items" ADD CONSTRAINT "site_settings_highlights_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_highlights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_highlights" ADD CONSTRAINT "site_settings_highlights_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_highlights" ADD CONSTRAINT "site_settings_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_highlights_locales" ADD CONSTRAINT "site_settings_highlights_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_highlights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_content_expertise_items" ADD CONSTRAINT "site_settings_content_expertise_items_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_content_expertise_items" ADD CONSTRAINT "site_settings_content_expertise_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_content_expertise_items_locales" ADD CONSTRAINT "site_settings_content_expertise_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_content_expertise_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_content_experience_items" ADD CONSTRAINT "site_settings_content_experience_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_content_experience_items_locales" ADD CONSTRAINT "site_settings_content_experience_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_content_experience_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_content_education_items" ADD CONSTRAINT "site_settings_content_education_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_content_education_items_locales" ADD CONSTRAINT "site_settings_content_education_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_content_education_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_content_tools_items" ADD CONSTRAINT "site_settings_content_tools_items_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_content_tools_items" ADD CONSTRAINT "site_settings_content_tools_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_brand_photo_id_media_id_fk" FOREIGN KEY ("brand_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_brand_avatar_id_media_id_fk" FOREIGN KEY ("brand_avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_brand_hero_cover_id_media_id_fk" FOREIGN KEY ("brand_hero_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_brand_brand_logo_id_media_id_fk" FOREIGN KEY ("brand_brand_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_brand_favicon_id_media_id_fk" FOREIGN KEY ("brand_favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tenants_fk" FOREIGN KEY ("tenants_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_logos_fk" FOREIGN KEY ("logos_id") REFERENCES "public"."logos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_achievements_fk" FOREIGN KEY ("achievements_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_visits_fk" FOREIGN KEY ("visits_id") REFERENCES "public"."visits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_site_settings_fk" FOREIGN KEY ("site_settings_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_tenants_order_idx" ON "users_tenants" USING btree ("_order");
  CREATE INDEX "users_tenants_parent_id_idx" ON "users_tenants" USING btree ("_parent_id");
  CREATE INDEX "users_tenants_tenant_idx" ON "users_tenants" USING btree ("tenant_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "tenants_slug_idx" ON "tenants" USING btree ("slug");
  CREATE UNIQUE INDEX "tenants_domain_idx" ON "tenants" USING btree ("domain");
  CREATE INDEX "tenants_updated_at_idx" ON "tenants" USING btree ("updated_at");
  CREATE INDEX "tenants_created_at_idx" ON "tenants" USING btree ("created_at");
  CREATE INDEX "media_tenant_idx" ON "media" USING btree ("tenant_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_images_order_idx" ON "projects_images" USING btree ("_order");
  CREATE INDEX "projects_images_parent_id_idx" ON "projects_images" USING btree ("_parent_id");
  CREATE INDEX "projects_images_image_idx" ON "projects_images" USING btree ("image_id");
  CREATE INDEX "projects_blocks_text_order_idx" ON "projects_blocks_text" USING btree ("_order");
  CREATE INDEX "projects_blocks_text_parent_id_idx" ON "projects_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_text_path_idx" ON "projects_blocks_text" USING btree ("_path");
  CREATE UNIQUE INDEX "projects_blocks_text_locales_locale_parent_id_unique" ON "projects_blocks_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_blocks_image_order_idx" ON "projects_blocks_image" USING btree ("_order");
  CREATE INDEX "projects_blocks_image_parent_id_idx" ON "projects_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_image_path_idx" ON "projects_blocks_image" USING btree ("_path");
  CREATE INDEX "projects_blocks_image_src_idx" ON "projects_blocks_image" USING btree ("src_id");
  CREATE INDEX "projects_blocks_grid_items_order_idx" ON "projects_blocks_grid_items" USING btree ("_order");
  CREATE INDEX "projects_blocks_grid_items_parent_id_idx" ON "projects_blocks_grid_items" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_grid_items_src_idx" ON "projects_blocks_grid_items" USING btree ("src_id");
  CREATE INDEX "projects_blocks_grid_order_idx" ON "projects_blocks_grid" USING btree ("_order");
  CREATE INDEX "projects_blocks_grid_parent_id_idx" ON "projects_blocks_grid" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_grid_path_idx" ON "projects_blocks_grid" USING btree ("_path");
  CREATE INDEX "projects_blocks_video_order_idx" ON "projects_blocks_video" USING btree ("_order");
  CREATE INDEX "projects_blocks_video_parent_id_idx" ON "projects_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_video_path_idx" ON "projects_blocks_video" USING btree ("_path");
  CREATE INDEX "projects_blocks_beforeafter_order_idx" ON "projects_blocks_beforeafter" USING btree ("_order");
  CREATE INDEX "projects_blocks_beforeafter_parent_id_idx" ON "projects_blocks_beforeafter" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_beforeafter_path_idx" ON "projects_blocks_beforeafter" USING btree ("_path");
  CREATE INDEX "projects_blocks_beforeafter_before_idx" ON "projects_blocks_beforeafter" USING btree ("before_id");
  CREATE INDEX "projects_blocks_beforeafter_after_idx" ON "projects_blocks_beforeafter" USING btree ("after_id");
  CREATE UNIQUE INDEX "projects_blocks_beforeafter_locales_locale_parent_id_unique" ON "projects_blocks_beforeafter_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_blocks_separator_order_idx" ON "projects_blocks_separator" USING btree ("_order");
  CREATE INDEX "projects_blocks_separator_parent_id_idx" ON "projects_blocks_separator" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_separator_path_idx" ON "projects_blocks_separator" USING btree ("_path");
  CREATE INDEX "projects_tenant_idx" ON "projects" USING btree ("tenant_id");
  CREATE INDEX "projects_cover_idx" ON "projects" USING btree ("cover_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE UNIQUE INDEX "projects_locales_locale_parent_id_unique" ON "projects_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "articles_tags_order_idx" ON "articles_tags" USING btree ("_order");
  CREATE INDEX "articles_tags_parent_id_idx" ON "articles_tags" USING btree ("_parent_id");
  CREATE INDEX "articles_tenant_idx" ON "articles" USING btree ("tenant_id");
  CREATE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  CREATE INDEX "articles_cover_idx" ON "articles" USING btree ("cover_id");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE UNIQUE INDEX "articles_locales_locale_parent_id_unique" ON "articles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "logos_tenant_idx" ON "logos" USING btree ("tenant_id");
  CREATE INDEX "logos_logo_idx" ON "logos" USING btree ("logo_id");
  CREATE INDEX "logos_updated_at_idx" ON "logos" USING btree ("updated_at");
  CREATE INDEX "logos_created_at_idx" ON "logos" USING btree ("created_at");
  CREATE INDEX "testimonials_tenant_idx" ON "testimonials" USING btree ("tenant_id");
  CREATE INDEX "testimonials_avatar_idx" ON "testimonials" USING btree ("avatar_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE UNIQUE INDEX "testimonials_locales_locale_parent_id_unique" ON "testimonials_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "achievements_tenant_idx" ON "achievements" USING btree ("tenant_id");
  CREATE INDEX "achievements_icon_idx" ON "achievements" USING btree ("icon_id");
  CREATE INDEX "achievements_updated_at_idx" ON "achievements" USING btree ("updated_at");
  CREATE INDEX "achievements_created_at_idx" ON "achievements" USING btree ("created_at");
  CREATE UNIQUE INDEX "achievements_locales_locale_parent_id_unique" ON "achievements_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "visits_tenant_idx" ON "visits" USING btree ("tenant_id");
  CREATE INDEX "visits_visitor_id_idx" ON "visits" USING btree ("visitor_id");
  CREATE INDEX "visits_project_idx" ON "visits" USING btree ("project_id");
  CREATE INDEX "visits_visited_at_idx" ON "visits" USING btree ("visited_at");
  CREATE INDEX "visits_updated_at_idx" ON "visits" USING btree ("updated_at");
  CREATE INDEX "visits_created_at_idx" ON "visits" USING btree ("created_at");
  CREATE INDEX "site_settings_social_visible_order_idx" ON "site_settings_social_visible" USING btree ("order");
  CREATE INDEX "site_settings_social_visible_parent_idx" ON "site_settings_social_visible" USING btree ("parent_id");
  CREATE INDEX "site_settings_categories_image_order_idx" ON "site_settings_categories_image" USING btree ("_order");
  CREATE INDEX "site_settings_categories_image_parent_id_idx" ON "site_settings_categories_image" USING btree ("_parent_id");
  CREATE INDEX "site_settings_categories_video_order_idx" ON "site_settings_categories_video" USING btree ("_order");
  CREATE INDEX "site_settings_categories_video_parent_id_idx" ON "site_settings_categories_video" USING btree ("_parent_id");
  CREATE INDEX "site_settings_navbar_links_order_idx" ON "site_settings_navbar_links" USING btree ("_order");
  CREATE INDEX "site_settings_navbar_links_parent_id_idx" ON "site_settings_navbar_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_settings_navbar_links_locales_locale_parent_id_unique" ON "site_settings_navbar_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_sections_order_idx" ON "site_settings_sections" USING btree ("_order");
  CREATE INDEX "site_settings_sections_parent_id_idx" ON "site_settings_sections" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_settings_sections_locales_locale_parent_id_unique" ON "site_settings_sections_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_mobile_bar_buttons_order_idx" ON "site_settings_mobile_bar_buttons" USING btree ("_order");
  CREATE INDEX "site_settings_mobile_bar_buttons_parent_id_idx" ON "site_settings_mobile_bar_buttons" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_settings_mobile_bar_buttons_locales_locale_parent_id_un" ON "site_settings_mobile_bar_buttons_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_highlights_items_order_idx" ON "site_settings_highlights_items" USING btree ("_order");
  CREATE INDEX "site_settings_highlights_items_parent_id_idx" ON "site_settings_highlights_items" USING btree ("_parent_id");
  CREATE INDEX "site_settings_highlights_items_media_idx" ON "site_settings_highlights_items" USING btree ("media_id");
  CREATE INDEX "site_settings_highlights_order_idx" ON "site_settings_highlights" USING btree ("_order");
  CREATE INDEX "site_settings_highlights_parent_id_idx" ON "site_settings_highlights" USING btree ("_parent_id");
  CREATE INDEX "site_settings_highlights_cover_idx" ON "site_settings_highlights" USING btree ("cover_id");
  CREATE UNIQUE INDEX "site_settings_highlights_locales_locale_parent_id_unique" ON "site_settings_highlights_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_content_expertise_items_order_idx" ON "site_settings_content_expertise_items" USING btree ("_order");
  CREATE INDEX "site_settings_content_expertise_items_parent_id_idx" ON "site_settings_content_expertise_items" USING btree ("_parent_id");
  CREATE INDEX "site_settings_content_expertise_items_icon_idx" ON "site_settings_content_expertise_items" USING btree ("icon_id");
  CREATE UNIQUE INDEX "site_settings_content_expertise_items_locales_locale_parent_" ON "site_settings_content_expertise_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_content_experience_items_order_idx" ON "site_settings_content_experience_items" USING btree ("_order");
  CREATE INDEX "site_settings_content_experience_items_parent_id_idx" ON "site_settings_content_experience_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_settings_content_experience_items_locales_locale_parent" ON "site_settings_content_experience_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_content_education_items_order_idx" ON "site_settings_content_education_items" USING btree ("_order");
  CREATE INDEX "site_settings_content_education_items_parent_id_idx" ON "site_settings_content_education_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_settings_content_education_items_locales_locale_parent_" ON "site_settings_content_education_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_content_tools_items_order_idx" ON "site_settings_content_tools_items" USING btree ("_order");
  CREATE INDEX "site_settings_content_tools_items_parent_id_idx" ON "site_settings_content_tools_items" USING btree ("_parent_id");
  CREATE INDEX "site_settings_content_tools_items_icon_idx" ON "site_settings_content_tools_items" USING btree ("icon_id");
  CREATE UNIQUE INDEX "site_settings_tenant_idx" ON "site_settings" USING btree ("tenant_id");
  CREATE INDEX "site_settings_brand_brand_photo_idx" ON "site_settings" USING btree ("brand_photo_id");
  CREATE INDEX "site_settings_brand_brand_avatar_idx" ON "site_settings" USING btree ("brand_avatar_id");
  CREATE INDEX "site_settings_brand_brand_hero_cover_idx" ON "site_settings" USING btree ("brand_hero_cover_id");
  CREATE INDEX "site_settings_brand_brand_brand_logo_idx" ON "site_settings" USING btree ("brand_brand_logo_id");
  CREATE INDEX "site_settings_brand_brand_favicon_idx" ON "site_settings" USING btree ("brand_favicon_id");
  CREATE INDEX "site_settings_updated_at_idx" ON "site_settings" USING btree ("updated_at");
  CREATE INDEX "site_settings_created_at_idx" ON "site_settings" USING btree ("created_at");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_tenants_id_idx" ON "payload_locked_documents_rels" USING btree ("tenants_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_logos_id_idx" ON "payload_locked_documents_rels" USING btree ("logos_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_achievements_id_idx" ON "payload_locked_documents_rels" USING btree ("achievements_id");
  CREATE INDEX "payload_locked_documents_rels_visits_id_idx" ON "payload_locked_documents_rels" USING btree ("visits_id");
  CREATE INDEX "payload_locked_documents_rels_site_settings_id_idx" ON "payload_locked_documents_rels" USING btree ("site_settings_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_tenants" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "tenants" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "projects_images" CASCADE;
  DROP TABLE "projects_blocks_text" CASCADE;
  DROP TABLE "projects_blocks_text_locales" CASCADE;
  DROP TABLE "projects_blocks_image" CASCADE;
  DROP TABLE "projects_blocks_grid_items" CASCADE;
  DROP TABLE "projects_blocks_grid" CASCADE;
  DROP TABLE "projects_blocks_video" CASCADE;
  DROP TABLE "projects_blocks_beforeafter" CASCADE;
  DROP TABLE "projects_blocks_beforeafter_locales" CASCADE;
  DROP TABLE "projects_blocks_separator" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_locales" CASCADE;
  DROP TABLE "articles_tags" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "articles_locales" CASCADE;
  DROP TABLE "logos" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "testimonials_locales" CASCADE;
  DROP TABLE "achievements" CASCADE;
  DROP TABLE "achievements_locales" CASCADE;
  DROP TABLE "visits" CASCADE;
  DROP TABLE "site_settings_social_visible" CASCADE;
  DROP TABLE "site_settings_categories_image" CASCADE;
  DROP TABLE "site_settings_categories_video" CASCADE;
  DROP TABLE "site_settings_navbar_links" CASCADE;
  DROP TABLE "site_settings_navbar_links_locales" CASCADE;
  DROP TABLE "site_settings_sections" CASCADE;
  DROP TABLE "site_settings_sections_locales" CASCADE;
  DROP TABLE "site_settings_mobile_bar_buttons" CASCADE;
  DROP TABLE "site_settings_mobile_bar_buttons_locales" CASCADE;
  DROP TABLE "site_settings_highlights_items" CASCADE;
  DROP TABLE "site_settings_highlights" CASCADE;
  DROP TABLE "site_settings_highlights_locales" CASCADE;
  DROP TABLE "site_settings_content_expertise_items" CASCADE;
  DROP TABLE "site_settings_content_expertise_items_locales" CASCADE;
  DROP TABLE "site_settings_content_experience_items" CASCADE;
  DROP TABLE "site_settings_content_experience_items_locales" CASCADE;
  DROP TABLE "site_settings_content_education_items" CASCADE;
  DROP TABLE "site_settings_content_education_items_locales" CASCADE;
  DROP TABLE "site_settings_content_tools_items" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_projects_blocks_text_text_type";
  DROP TYPE "public"."enum_projects_blocks_separator_spacing";
  DROP TYPE "public"."enum_projects_media_type";
  DROP TYPE "public"."enum_projects_project_type";
  DROP TYPE "public"."enum_projects_video_kind";
  DROP TYPE "public"."enum_articles_mode";
  DROP TYPE "public"."enum_testimonials_source";
  DROP TYPE "public"."enum_visits_device";
  DROP TYPE "public"."enum_site_settings_social_visible";
  DROP TYPE "public"."enum_site_settings_sections_section_id";
  DROP TYPE "public"."enum_site_settings_mobile_bar_buttons_pos";
  DROP TYPE "public"."enum_site_settings_mobile_bar_buttons_type";
  DROP TYPE "public"."enum_site_settings_highlights_items_type";
  DROP TYPE "public"."enum_site_settings_background_preset";
  DROP TYPE "public"."enum_site_settings_background_type";
  DROP TYPE "public"."enum_site_settings_style_theme";
  DROP TYPE "public"."enum_site_settings_style_hero";
  DROP TYPE "public"."enum_site_settings_style_about";
  DROP TYPE "public"."enum_site_settings_style_projects";
  DROP TYPE "public"."enum_site_settings_style_contact";
  DROP TYPE "public"."enum_site_settings_style_skills";
  DROP TYPE "public"."enum_site_settings_style_tools";
  DROP TYPE "public"."enum_site_settings_style_exp";
  DROP TYPE "public"."enum_site_settings_style_font";
  DROP TYPE "public"."enum_site_settings_style_direction";
  DROP TYPE "public"."enum_site_settings_style_cursor";
  DROP TYPE "public"."enum_site_settings_style_anim";
  DROP TYPE "public"."enum_site_settings_theme_config_components_card";
  DROP TYPE "public"."enum_site_settings_theme_config_components_navbar";
  DROP TYPE "public"."enum_site_settings_theme_config_components_button";`)
}
