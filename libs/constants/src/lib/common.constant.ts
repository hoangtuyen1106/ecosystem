export const PORT = 3000;

export const FIELD = 'field';
export const FULL_INFO = 'full_info';
export const LIST_INFO = 'list_info';
export const SIMPLE_INFO = 'simple_info';

export type INFO_TYPE = typeof FULL_INFO | typeof LIST_INFO | typeof SIMPLE_INFO;

export const ACTIVE = 'active';
export const INACTIVE = 'inactive';
export const BLOCKED = 'blocked';
export const PENDING = 'pending';

export enum MetadataKeys {
  PROCESS_ID = 'processId',
  START_TIME = 'startTime',
  SECURED = 'secured',
  USER_DATA = 'userData',
}
