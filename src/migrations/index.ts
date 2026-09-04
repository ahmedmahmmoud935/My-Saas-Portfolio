import * as migration_20260709_062018_initial from './20260709_062018_initial';
import * as migration_20260709_171646_add_r2_storage from './20260709_171646_add_r2_storage';
import * as migration_20260710_093433_add_project_published from './20260710_093433_add_project_published';
import * as migration_20260711_095532_add_carousel_block from './20260711_095532_add_carousel_block';
import * as migration_20260712_134348_add_expertise_layout from './20260712_134348_add_expertise_layout';
import * as migration_20260712_141437_add_expertise_bg from './20260712_141437_add_expertise_bg';
import * as migration_20260713_172121_add_light_colors from './20260713_172121_add_light_colors';
import * as migration_20260713_220315_add_hero_gradient from './20260713_220315_add_hero_gradient';
import * as migration_20260718_145333_add_user_activation from './20260718_145333_add_user_activation';
import * as migration_20260718_204656_add_tenant_suspended from './20260718_204656_add_tenant_suspended';
import * as migration_20260719_104557_add_imports from './20260719_104557_add_imports';
import * as migration_20260810_224850_add_landing_global from './20260810_224850_add_landing_global';
import * as migration_20260812_105131 from './20260812_105131';
import * as migration_20260812_110603 from './20260812_110603';
import * as migration_20260812_201359 from './20260812_201359';
import * as migration_20260815_000255_section_bg_per_theme from './20260815_000255_section_bg_per_theme';
import * as migration_20260815_010000_drop_dead_design_fields from './20260815_010000_drop_dead_design_fields';
import * as migration_20260824_150000_add_video_poster from './20260824_150000_add_video_poster';
import * as migration_20260825_020000_add_hero_overlay_light from './20260825_020000_add_hero_overlay_light';
import * as migration_20260826_020000_split_font_choice from './20260826_020000_split_font_choice';
import * as migration_20260826_040000_add_grid_mobile_cols from './20260826_040000_add_grid_mobile_cols';
import * as migration_20260827_190000_bilingual_categories from './20260827_190000_bilingual_categories';
import * as migration_20260827_200000_section_bg_position from './20260827_200000_section_bg_position';
import * as migration_20260831_010000_landing_design from './20260831_010000_landing_design';
import * as migration_20260831_030000_landing_card_styles from './20260831_030000_landing_card_styles';
import * as migration_20260901_010000_hero_description from './20260901_010000_hero_description';
import * as migration_20260901_030000_hero_title_scale from './20260901_030000_hero_title_scale';
import * as migration_20260902_010000_hero_text_controls from './20260902_010000_hero_text_controls';
import * as migration_20260903_010000_seo_fields from './20260903_010000_seo_fields';
import * as migration_20260903_030000_seo_keyphrase from './20260903_030000_seo_keyphrase';
import * as migration_20260904_010000_redirects from './20260904_010000_redirects';
import * as migration_20260905_010000_search_tools from './20260905_010000_search_tools';
import * as migration_20260906_010000_posts from './20260906_010000_posts';

export const migrations = [
  {
    up: migration_20260709_062018_initial.up,
    down: migration_20260709_062018_initial.down,
    name: '20260709_062018_initial',
  },
  {
    up: migration_20260709_171646_add_r2_storage.up,
    down: migration_20260709_171646_add_r2_storage.down,
    name: '20260709_171646_add_r2_storage',
  },
  {
    up: migration_20260710_093433_add_project_published.up,
    down: migration_20260710_093433_add_project_published.down,
    name: '20260710_093433_add_project_published',
  },
  {
    up: migration_20260711_095532_add_carousel_block.up,
    down: migration_20260711_095532_add_carousel_block.down,
    name: '20260711_095532_add_carousel_block',
  },
  {
    up: migration_20260712_134348_add_expertise_layout.up,
    down: migration_20260712_134348_add_expertise_layout.down,
    name: '20260712_134348_add_expertise_layout',
  },
  {
    up: migration_20260712_141437_add_expertise_bg.up,
    down: migration_20260712_141437_add_expertise_bg.down,
    name: '20260712_141437_add_expertise_bg',
  },
  {
    up: migration_20260713_172121_add_light_colors.up,
    down: migration_20260713_172121_add_light_colors.down,
    name: '20260713_172121_add_light_colors',
  },
  {
    up: migration_20260713_220315_add_hero_gradient.up,
    down: migration_20260713_220315_add_hero_gradient.down,
    name: '20260713_220315_add_hero_gradient',
  },
  {
    up: migration_20260718_145333_add_user_activation.up,
    down: migration_20260718_145333_add_user_activation.down,
    name: '20260718_145333_add_user_activation',
  },
  {
    up: migration_20260718_204656_add_tenant_suspended.up,
    down: migration_20260718_204656_add_tenant_suspended.down,
    name: '20260718_204656_add_tenant_suspended',
  },
  {
    up: migration_20260719_104557_add_imports.up,
    down: migration_20260719_104557_add_imports.down,
    name: '20260719_104557_add_imports',
  },
  {
    up: migration_20260810_224850_add_landing_global.up,
    down: migration_20260810_224850_add_landing_global.down,
    name: '20260810_224850_add_landing_global',
  },
  {
    up: migration_20260812_105131.up,
    down: migration_20260812_105131.down,
    name: '20260812_105131',
  },
  {
    up: migration_20260812_110603.up,
    down: migration_20260812_110603.down,
    name: '20260812_110603',
  },
  {
    up: migration_20260812_201359.up,
    down: migration_20260812_201359.down,
    name: '20260812_201359'
  },
  {
    up: migration_20260815_000255_section_bg_per_theme.up,
    down: migration_20260815_000255_section_bg_per_theme.down,
    name: '20260815_000255_section_bg_per_theme'
  },
  {
    up: migration_20260815_010000_drop_dead_design_fields.up,
    down: migration_20260815_010000_drop_dead_design_fields.down,
    name: '20260815_010000_drop_dead_design_fields'
  },
  {
    up: migration_20260824_150000_add_video_poster.up,
    down: migration_20260824_150000_add_video_poster.down,
    name: '20260824_150000_add_video_poster'
  },
  {
    up: migration_20260825_020000_add_hero_overlay_light.up,
    down: migration_20260825_020000_add_hero_overlay_light.down,
    name: '20260825_020000_add_hero_overlay_light'
  },
  {
    up: migration_20260826_020000_split_font_choice.up,
    down: migration_20260826_020000_split_font_choice.down,
    name: '20260826_020000_split_font_choice'
  },
  {
    up: migration_20260826_040000_add_grid_mobile_cols.up,
    down: migration_20260826_040000_add_grid_mobile_cols.down,
    name: '20260826_040000_add_grid_mobile_cols'
  },
  {
    up: migration_20260827_190000_bilingual_categories.up,
    down: migration_20260827_190000_bilingual_categories.down,
    name: '20260827_190000_bilingual_categories'
  },
  {
    up: migration_20260827_200000_section_bg_position.up,
    down: migration_20260827_200000_section_bg_position.down,
    name: '20260827_200000_section_bg_position'
  },
  {
    up: migration_20260831_010000_landing_design.up,
    down: migration_20260831_010000_landing_design.down,
    name: '20260831_010000_landing_design'
  },
  {
    up: migration_20260831_030000_landing_card_styles.up,
    down: migration_20260831_030000_landing_card_styles.down,
    name: '20260831_030000_landing_card_styles'
  },
  {
    up: migration_20260901_010000_hero_description.up,
    down: migration_20260901_010000_hero_description.down,
    name: '20260901_010000_hero_description'
  },
  {
    up: migration_20260901_030000_hero_title_scale.up,
    down: migration_20260901_030000_hero_title_scale.down,
    name: '20260901_030000_hero_title_scale'
  },
  {
    up: migration_20260902_010000_hero_text_controls.up,
    down: migration_20260902_010000_hero_text_controls.down,
    name: '20260902_010000_hero_text_controls'
  },
  {
    up: migration_20260903_010000_seo_fields.up,
    down: migration_20260903_010000_seo_fields.down,
    name: '20260903_010000_seo_fields'
  },
  {
    up: migration_20260903_030000_seo_keyphrase.up,
    down: migration_20260903_030000_seo_keyphrase.down,
    name: '20260903_030000_seo_keyphrase'
  },
  {
    up: migration_20260904_010000_redirects.up,
    down: migration_20260904_010000_redirects.down,
    name: '20260904_010000_redirects'
  },
  {
    up: migration_20260905_010000_search_tools.up,
    down: migration_20260905_010000_search_tools.down,
    name: '20260905_010000_search_tools'
  },
  {
    up: migration_20260906_010000_posts.up,
    down: migration_20260906_010000_posts.down,
    name: '20260906_010000_posts'
  },
];
