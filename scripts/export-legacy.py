#!/usr/bin/env python3
"""
Export the old Flask SQLite portfolio DB into a normalized JSON that the
guarded `/api/migrate` route consumes to rebuild the data in Payload.

Localized leaves are emitted as   {"__loc": {"ar": "...", "en": "..."}}
Media (R2/CDN URLs) are emitted as {"__media": "https://cdn.viralpx.com/..."}
so the route can run a generic two-pass (ar→en) + resolve uploads by URL.

Usage:  python3 scripts/export-legacy.py <old.db> > scripts/legacy-data.json
"""
import sqlite3, json, sys

# username(lowercased) -> login email + owner flag. Passwords are set by the route.
USERS = {
    "ahmed": {"email": "ahmed@viralpx.test", "isOwner": True, "name": "Ahmed Mahmoud"},
    "omar": {"email": "omar@viralpx.test", "isOwner": False, "name": "Omar"},
    "adventures": {"email": "adventures@viralpx.test", "isOwner": False, "name": "Adventures"},
    "kamal": {"email": "kamal@viralpx.test", "isOwner": False, "name": "Kamal"},
}

# Allowed enum values (mirror src/globals/SiteSettings.ts) — invalid → default/omit.
ENUMS = {
    "style.theme": {"default", "kinetic"},
    "style.hero": {"centered", "split", "massive", "cover-full", "minimal"},
    "style.about": {"classic", "visual", "simple"},
    "style.projects": {"grid", "masonry", "list", "freegrid"},
    "style.contact": {"classic", "split"},
    "style.skills": {"tags", "inline", "bars"},
    "style.tools": {"classic", "compact"},
    "style.exp": {"classic", "timeline"},
    "style.font": {"default", "modern", "editorial", "elegant", "bold"},
    "style.direction": {"auto", "rtl", "ltr"},
    "style.cursor": {"default", "dot-ring"},
    "style.anim": {"fade-up", "fade", "none"},
    "bg.preset": {"dark", "ocean", "sunset", "forest", "mono", "pearl"},
    "bg.type": {"solid", "gradient"},
    "card": {"solid", "glass", "outline"},
    "navbar": {"blur", "solid", "transparent"},
    "button": {"rounded", "sharp", "pill"},
}
SECTION_IDS = {"hero", "about", "projects", "achievements", "expertise", "testimonials",
               "logos", "experience", "tools", "education", "skills", "contact"}


def L(ar, en=None):
    ar = (ar or "").strip()
    en = (en or "").strip()
    if not ar and not en:
        return None
    return {"__loc": {"ar": ar or en, "en": en or ar}}


def M(url):
    url = (url or "").strip()
    if url.startswith("http"):
        return {"__media": url}
    return None


def num(v, default=None):
    try:
        return float(v)
    except (TypeError, ValueError):
        return default


def enum(val, key, default=None):
    val = (val or "").strip()
    return val if val in ENUMS.get(key, set()) else default


def loads(v, fallback):
    try:
        return json.loads(v) if v else fallback
    except (json.JSONDecodeError, TypeError):
        return fallback


def clean(d):
    """Drop None values recursively so we don't write empty markers."""
    if isinstance(d, dict):
        return {k: clean(v) for k, v in d.items() if v is not None}
    if isinstance(d, list):
        return [clean(x) for x in d]
    return d


def build_settings(s):
    """s = {key: value} for one user. Returns marker-annotated site-settings data."""
    def g(k, default=""):
        return s.get(k, default)

    content_raw = loads(g("content"), {})
    hero = content_raw.get("hero", {})
    about = content_raw.get("about", {})
    exp_g = content_raw.get("expertise", {})
    experience = content_raw.get("experience", {})
    education = content_raw.get("education", {})
    skills = content_raw.get("skills", {})
    tools = content_raw.get("tools", {})
    projects_c = content_raw.get("projects", {})
    contact = content_raw.get("contact", {})

    # nested item lists are stored as JSON strings
    exp_items = loads(exp_g.get("items"), []) if isinstance(exp_g.get("items"), str) else exp_g.get("items", [])
    experience_items = loads(experience.get("items"), []) if isinstance(experience.get("items"), str) else experience.get("items", [])
    education_items = loads(education.get("items"), []) if isinstance(education.get("items"), str) else education.get("items", [])
    tools_items = loads(tools.get("items"), []) if isinstance(tools.get("items"), str) else tools.get("items", [])

    # accent palette: prefer `colors`, else the active theme's overrides
    colors = loads(g("colors"), {})
    if not colors.get("accent"):
        overrides = loads(g("theme_overrides"), {})
        active = g("style_theme")
        pick = overrides.get(active) or (next(iter(overrides.values()), {}) if overrides else {})
        colors = pick.get("colors", {}) if isinstance(pick, dict) else {}

    tc = loads(g("theme_config"), {})
    comps = tc.get("components", {}) if isinstance(tc, dict) else {}

    def cat_list(key):
        return [{"name": c} for c in loads(g(key), []) if c]

    def tabs():
        pt = loads(g("proj_tabs"), {})
        out = {}
        for k in ("designs", "reels", "videos"):
            t = pt.get(k, {})
            out[k] = clean({
                "visible": bool(t.get("visible", True)),
                "label": L(t.get("label_ar"), t.get("label_en")),
                "icon": t.get("icon") or None,
            })
        return out

    def navbar():
        out = []
        for l in loads(g("navbar_links"), []):
            out.append(clean({
                "linkId": l.get("id"),
                "label": L(l.get("label_ar"), l.get("label_en")),
                "visible": bool(l.get("visible", True)),
            }))
        return [x for x in out if x.get("linkId")]

    def sections():
        out = []
        for sec in loads(g("sections"), []):
            sid = sec.get("id")
            if sid not in SECTION_IDS:
                continue
            out.append(clean({
                "sectionId": sid,
                "label": L(sec.get("label_ar"), sec.get("label_en")),
                "visible": bool(sec.get("visible", True)),
                "order": sec.get("order", 0),
            }))
        return out

    def highlights():
        out = []
        for h in loads(g("highlights"), []):
            items = [clean({"type": it.get("type", "image"), "media": M(it.get("url"))})
                     for it in h.get("items", []) if M(it.get("url"))]
            out.append(clean({
                "title": L(h.get("title_ar"), h.get("title_en")),
                "cover": M(h.get("cover_url")),
                "items": items,
            }))
        return out

    data = {
        "siteName": USERS_BY_NAME_HINT.get("name", "Portfolio"),
        "social": clean({
            "whatsapp": g("whatsapp") or None,
            "behance": g("behance") or None,
            "instagram": g("instagram") or None,
            "linkedin": g("linkedin") or None,
            "facebook": g("facebook") or None,
            "vimeo": g("vimeo") or None,
            "visible": [v for v in loads(g("social_visible"), []) if v] or None,
        }),
        "brand": clean({
            "photo": M(g("photo_url")),
            "avatar": M(g("photo_url")),
            "heroCover": M(g("hero_cover_url")),
            "brandLogo": M(g("brand_logo_url")),
            "favicon": M(g("favicon_url")),
            "brandLogoScale": num(g("brand_logo_scale"), 1),
            "brandLogoOffsetX": num(g("brand_logo_offset_x"), 0),
            "brandLogoOffsetY": num(g("brand_logo_offset_y"), 0),
        }),
        "heroCover": clean({
            "size": g("hero_cover_size") or "cover",
            "posX": num(g("hero_cover_pos_x"), 50),
            "posY": num(g("hero_cover_pos_y"), 50),
            "overlay": num(g("hero_cover_overlay"), 0),
            "height": num(g("hero_height"), 85),
        }),
        "colors": clean({
            "accent": colors.get("accent") or None,
            "bg": colors.get("bg") or None,
            "bg2": colors.get("bg2") or None,
            "text": colors.get("text") or None,
            "subtext": colors.get("subtext") or None,
        }),
        "background": clean({
            "preset": enum(g("style_bg_preset"), "bg.preset", "dark"),
            "type": enum(g("style_bg_type"), "bg.type", "solid"),
            "color1": g("style_bg_color1") or None,
            "color2": g("style_bg_color2") or None,
        }),
        "style": clean({
            "theme": enum(g("style_theme"), "style.theme", "default"),
            "hero": enum(g("style_hero"), "style.hero", "centered"),
            "about": enum(g("style_about"), "style.about", "classic"),
            "projects": enum(g("style_projects"), "style.projects", "grid"),
            "contact": enum(g("style_contact"), "style.contact", "classic"),
            "skills": enum(g("style_skills"), "style.skills", "tags"),
            "tools": enum(g("style_tools"), "style.tools", "classic"),
            "exp": enum(g("style_exp"), "style.exp", "classic"),
            "font": enum(g("style_font"), "style.font", "default"),
            "direction": enum(g("style_direction"), "style.direction", "auto"),
            "cursor": enum(g("style_cursor"), "style.cursor", "default"),
            "anim": enum(g("style_anim"), "style.anim", "fade-up"),
        }),
        "themeConfig": clean({
            "components": clean({
                "card": enum(comps.get("card"), "card", "solid"),
                "navbar": enum(comps.get("navbar"), "navbar", "blur"),
                "button": enum(comps.get("button"), "button", "rounded"),
            }),
            "tokens": tc or None,
        }),
        "footer": clean({
            "logoSize": num(g("footer_logo_size")),
            "logoAlign": g("footer_logo_align") or None,
            "socialsAlign": g("footer_socials_align") or None,
            "copyAlign": g("footer_copy_align") or None,
        }),
        "themeOverrides": loads(g("theme_overrides"), None),
        "gridCols": clean({
            "imageMobile": num(g("image_cols_mobile"), 2),
            "imageTablet": num(g("image_cols_tablet"), 3),
            "imageDesktop": num(g("image_cols_desktop"), 4),
            "videoMobile": num(g("video_cols_mobile"), 2),
            "videoTablet": num(g("video_cols_tablet"), 3),
            "videoDesktop": num(g("video_cols_desktop"), 4),
            "freegridMobile": num(g("freegrid_cols_mobile"), 1),
            "freegridDesktop": num(g("freegrid_cols_desktop"), 2),
        }),
        "categories": clean({
            "image": cat_list("image_categories"),
            "video": cat_list("video_categories"),
        }),
        "projTabs": tabs(),
        "navbarLinks": navbar(),
        "sections": sections(),
        "highlights": highlights(),
        "content": {
            "hero": clean({
                "name": L(hero.get("name_ar"), hero.get("name_en")),
                "title": L(hero.get("title_ar"), hero.get("title_en")),
                "btn1": L(hero.get("btn1_ar"), hero.get("btn1_en")),
                "btn2": L(hero.get("btn2_ar"), hero.get("btn2_en")),
            }),
            "about": clean({
                "text": L(about.get("text_ar"), about.get("text_en")),
                "tags": L(about.get("tags_ar"), about.get("tags_en")),
            }),
            "expertise": clean({
                "title": L(exp_g.get("title_ar"), exp_g.get("title_en")),
                "items": [clean({
                    "title": L(i.get("title_ar"), i.get("title_en")),
                    "description": L(i.get("points_ar"), i.get("points_en")),
                    "icon": M(i.get("img_url")),
                }) for i in exp_items],
            }),
            "experience": clean({
                "items": [clean({
                    "company": i.get("company_en") or i.get("company_ar") or None,
                    "role": L(i.get("role_ar"), i.get("role_en")),
                    "period": i.get("years") or None,
                }) for i in experience_items],
            }),
            "education": clean({
                "items": [clean({
                    "title": L(i.get("degree_ar"), i.get("degree_en")),
                    "org": L(i.get("school_ar"), i.get("school_en")),
                    "period": i.get("years") or None,
                }) for i in education_items],
            }),
            "skills": clean({
                "items": L(skills.get("items_ar"), skills.get("items_en")),
            }),
            "tools": clean({
                "items": [clean({"name": i.get("name"), "icon": M(i.get("icon"))})
                          for i in tools_items if i.get("name")],
            }),
            "projects": clean({
                "title": L(projects_c.get("title_ar"), projects_c.get("title_en")),
                "subtitle": L(projects_c.get("subtitle_ar"), projects_c.get("subtitle_en")),
            }),
            "contact": clean({
                "title": L(contact.get("title_ar"), contact.get("title_en")),
                "subtitle": L(contact.get("subtitle_ar"), contact.get("subtitle_en")),
                "email": contact.get("email") or g("contact_email") or None,
                "phone": contact.get("phone") or None,
            }),
        },
    }
    return clean(data)


def map_module(m):
    t = m.get("type")
    if t == "image":
        src = M(m.get("src"))
        return {"blockType": "image", "src": src} if src else None
    if t == "grid":
        items = [{"src": M(it.get("src"))} for it in m.get("items", []) if M(it.get("src"))]
        return {"blockType": "grid", "items": items} if items else None
    if t == "text":
        val = m.get("value") or ""
        return {"blockType": "text", "textType": m.get("textType", "p"), "value": L(val, val)}
    if t == "video":
        url = m.get("embedUrl") or m.get("rawUrl")
        return {"blockType": "video", "embedUrl": url} if url else None
    return None


def build_projects(db, uid):
    out = []
    for p in db.execute("SELECT * FROM projects WHERE user_id=? ORDER BY sort_order, id", (uid,)):
        imgs = [{"image": M(r["url"])} for r in
                db.execute("SELECT url FROM project_images WHERE project_id=? ORDER BY sort_order, id", (p["id"],))
                if M(r["url"])]
        modules = [x for x in (map_module(m) for m in loads(p["modules"], [])) if x]
        out.append(clean({
            "title": p["title"],
            "category": p["category"] or None,
            "description": p["description"] or None,
            "mediaType": p["media_type"] or "image",
            "projectType": p["project_type"] or "grid",
            "videoUrl": p["video_url"] or None,
            "videoKind": p["video_kind"] or "reel",
            "aspectRatio": p["aspect_ratio"] or "9:16",
            "sortOrder": p["sort_order"] or 0,
            "cover": M(p["cover_url"]),
            "images": imgs,
            "modules": modules,
        }))
    return out


def collect_media(node, acc):
    if isinstance(node, dict):
        if "__media" in node:
            acc.add(node["__media"])
        else:
            for v in node.values():
                collect_media(v, acc)
    elif isinstance(node, list):
        for v in node:
            collect_media(v, acc)


def main():
    db = sqlite3.connect(sys.argv[1])
    db.row_factory = sqlite3.Row
    tenants = []
    for row in db.execute("SELECT * FROM users ORDER BY id"):
        slug = row["username"].strip().lower()
        if slug not in USERS:
            continue
        meta = USERS[slug]
        global USERS_BY_NAME_HINT
        USERS_BY_NAME_HINT = meta
        settings = {r["key"]: r["value"] for r in
                    db.execute("SELECT key, value FROM settings WHERE user_id=?", (row["id"],))}
        uid = row["id"]

        site = build_settings(settings)
        projects = build_projects(db, uid)
        achievements = [clean({
            "title": L(a["title"], a["title_en"]),
            "value": (a["value"] or "0"),
            "icon": M(a["icon_url"]),
            "sortOrder": a["sort_order"] or 0,
        }) for a in db.execute("SELECT * FROM achievements WHERE user_id=? ORDER BY sort_order, id", (uid,))]
        logos = [clean({
            "name": l["name"] or "Client",
            "logo": M(l["logo_url"]),
            "websiteUrl": l["website_url"] or None,
            "sortOrder": l["sort_order"] or 0,
        }) for l in db.execute("SELECT * FROM client_logos WHERE user_id=? ORDER BY sort_order, id", (uid,))
            if M(l["logo_url"])]
        testimonials = [clean({
            "name": t["name"],
            "role": L(t["role"], t["role"]) if t["role"] else None,
            "company": t["company"] or None,
            "content": L(t["content"], t["content"]),
            "avatar": M(t["avatar_url"]),
            "rating": t["rating"] or 5,
            "source": t["source"] or "admin",
            "approved": bool(t["approved"]),
            "sortOrder": t["sort_order"] or 0,
        }) for t in db.execute("SELECT * FROM testimonials WHERE user_id=? ORDER BY sort_order, id", (uid,))]
        articles = [clean({
            "slug": a["slug"],
            "title": L(a["title_ar"], a["title_en"]),
            "excerpt": L(a["excerpt_ar"], a["excerpt_en"]),
            "cover": M(a["cover_url"]),
            "mode": "html",
            "contentHtml": a["content"] or "",
            "tags": [{"tag": x.strip()} for x in (a["tags"] or "").split(",") if x.strip()],
            "published": bool(a["published"]),
            "readMin": a["read_min"] or 3,
        }) for a in db.execute("SELECT * FROM articles WHERE user_id=? ORDER BY id", (uid,))]

        media = set()
        for blob in (site, projects, achievements, logos, testimonials, articles):
            collect_media(blob, media)

        tenants.append({
            "slug": slug,
            "name": meta["name"],
            "email": meta["email"],
            "isOwner": meta["isOwner"],
            "storageLimitMb": row["storage_limit_mb"] or 1024,
            "media": sorted(media),
            "siteSettings": site,
            "projects": projects,
            "achievements": achievements,
            "logos": logos,
            "testimonials": testimonials,
            "articles": articles,
        })

    json.dump({"tenants": tenants}, sys.stdout, ensure_ascii=False)


USERS_BY_NAME_HINT = {"name": "Portfolio"}
if __name__ == "__main__":
    main()
