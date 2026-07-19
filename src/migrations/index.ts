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
    name: '20260719_104557_add_imports'
  },
];
