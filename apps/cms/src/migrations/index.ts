import * as migration_20260912_114854 from './20260912_114854';
import * as migration_20260912_115008 from './20260912_115008';
import * as migration_20260912_124731 from './20260912_124731';
import * as migration_20260912_124950 from './20260912_124950';
import * as migration_20260912_125056 from './20260912_125056';
import * as migration_20260914_032538 from './20260914_032538';
import * as migration_20260914_065240 from './20260914_065240';
import * as migration_20260914_121211 from './20260914_121211';
import * as migration_20260914_131144 from './20260914_131144';
import * as migration_20260914_134031 from './20260914_134031';

export const migrations = [
  {
    up: migration_20260912_114854.up,
    down: migration_20260912_114854.down,
    name: '20260912_114854',
  },
  {
    up: migration_20260912_115008.up,
    down: migration_20260912_115008.down,
    name: '20260912_115008',
  },
  {
    up: migration_20260912_124731.up,
    down: migration_20260912_124731.down,
    name: '20260912_124731',
  },
  {
    up: migration_20260912_124950.up,
    down: migration_20260912_124950.down,
    name: '20260912_124950',
  },
  {
    up: migration_20260912_125056.up,
    down: migration_20260912_125056.down,
    name: '20260912_125056',
  },
  {
    up: migration_20260914_032538.up,
    down: migration_20260914_032538.down,
    name: '20260914_032538',
  },
  {
    up: migration_20260914_065240.up,
    down: migration_20260914_065240.down,
    name: '20260914_065240',
  },
  {
    up: migration_20260914_121211.up,
    down: migration_20260914_121211.down,
    name: '20260914_121211',
  },
  {
    up: migration_20260914_131144.up,
    down: migration_20260914_131144.down,
    name: '20260914_131144',
  },
  {
    up: migration_20260914_134031.up,
    down: migration_20260914_134031.down,
    name: '20260914_134031'
  },
];
