import * as migration_20260709_062018_initial from './20260709_062018_initial';
import * as migration_20260709_171646_add_r2_storage from './20260709_171646_add_r2_storage';

export const migrations = [
  {
    up: migration_20260709_062018_initial.up,
    down: migration_20260709_062018_initial.down,
    name: '20260709_062018_initial',
  },
  {
    up: migration_20260709_171646_add_r2_storage.up,
    down: migration_20260709_171646_add_r2_storage.down,
    name: '20260709_171646_add_r2_storage'
  },
];
