export const DEFAULT_TIME_ZONE = 'Asia/Ho_Chi_Minh';
export const DEFAULT_LOCALE = 'vi-VN';

export interface FormatDateTimeOptions {
  timeZone?: string;
  locale?: string;
}

export interface FormatResponseDatesOptions extends FormatDateTimeOptions {
  /** Object keys whose values are formatted. Defaults to `createdAt`/`updatedAt`. */
  fields?: string[];
}

const DEFAULT_DATE_FIELDS = ['createdAt', 'updatedAt'];

/**
 * Format a `Date` or ISO string as `DD/MM/YYYY HH:mm:ss` in the given time zone
 * (defaults to Asia/Ho_Chi_Minh). Returns `null` for empty/invalid input.
 */
export function formatDateTime(
  value: Date | string | null | undefined,
  options: FormatDateTimeOptions = {},
): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const parts = new Intl.DateTimeFormat(options.locale ?? DEFAULT_LOCALE, {
    timeZone: options.timeZone ?? DEFAULT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? '';

  return `${part('day')}/${part('month')}/${part('year')} ${part('hour')}:${part('minute')}:${part('second')}`;
}

/**
 * Recursively format date fields (`createdAt`/`updatedAt` by default) on a
 * response payload, including nested objects and arrays. Other values are
 * returned untouched.
 */
export function formatResponseDates<T>(
  data: T,
  options: FormatResponseDatesOptions = {},
): T {
  const fields = options.fields ?? DEFAULT_DATE_FIELDS;

  const walk = (value: unknown): unknown => {
    if (value === null || value === undefined) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map(walk);
    }

    if (value instanceof Date) {
      return formatDateTime(value, options);
    }

    if (typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([key, item]) => [
          key,
          fields.includes(key) ? formatDateTime(item as Date | string, options) : walk(item),
        ]),
      );
    }

    return value;
  };

  return walk(data) as T;
}
