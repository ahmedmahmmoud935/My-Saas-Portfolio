import * as migration_20260709_062018_initial from './20260709_062018_initial';

export const migrations = [
  {
    up: migration_20260709_062018_initial.up,
    down: migration_20260709_062018_initial.down,
    name: '20260709_062018_initial'
  },
];
