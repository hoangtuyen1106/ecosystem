const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const TOKEN_REGEX = /yyyy|MM|dd|HH|mm|ss/g;
const TOKEN_PATTERN: Record<string, string> = {
  yyyy: '(\\d{4})',
  MM: '(\\d{2})',
  dd: '(\\d{2})',
  HH: '(\\d{2})',
  mm: '(\\d{2})',
  ss: '(\\d{2})',
};

export type DateInput = Date | string | number | null | undefined;

function toValidDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === '') return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

const pad = (n: number, len = 2) => String(n).padStart(len, '0');

export interface FormatDateOptions {
  /** Giá trị trả về khi input không hợp lệ. Mặc định ''. */
  fallback?: string;
}

/**
 * Định dạng ngày giờ theo múi giờ Việt Nam (UTC+7).
 * Token hỗ trợ: yyyy, MM, dd, HH, mm, ss.
 *
 * @example
 * formatDate(new Date('2024-01-31T17:30:00Z'));                     // '01/02/2024'
 * formatDate(new Date('2024-01-31T17:30:00Z'), 'dd/MM/yyyy HH:mm'); // '01/02/2024 00:30'
 * formatDate(null, 'dd/MM/yyyy', { fallback: '--' });               // '--'
 */
export function formatDate(
  value: DateInput,
  pattern = 'dd/MM/yyyy',
  options: FormatDateOptions = {},
): string {
  const d = toValidDate(value);
  if (!d) return options.fallback ?? '';

  const vn = new Date(d.getTime() + VN_OFFSET_MS);
  const parts: Record<string, string> = {
    yyyy: pad(vn.getUTCFullYear(), 4),
    MM: pad(vn.getUTCMonth() + 1),
    dd: pad(vn.getUTCDate()),
    HH: pad(vn.getUTCHours()),
    mm: pad(vn.getUTCMinutes()),
    ss: pad(vn.getUTCSeconds()),
  };

  return pattern.replace(TOKEN_REGEX, (token) => parts[token]);
}

/**
 * Đọc chuỗi ngày giờ theo giờ Việt Nam, trả về Date (thời điểm UTC tương ứng).
 * Trả về null nếu sai định dạng hoặc ngày không tồn tại (31/02, 29/02/2023...).
 * Bắt buộc có yyyy, MM, dd; HH, mm, ss mặc định 0.
 *
 * @example
 * parseDate('01/02/2024')?.toISOString();                    // '2024-01-31T17:00:00.000Z'
 * parseDate('01/02/2024 08:30', 'dd/MM/yyyy HH:mm');
 * parseDate('31/02/2024');                                   // null
 */
export function parseDate(
  str?: string | null,
  pattern = 'dd/MM/yyyy',
): Date | null {
  if (!str) return null;

  const order: string[] = [];
  const source = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(TOKEN_REGEX, (token) => {
      order.push(token);
      return TOKEN_PATTERN[token];
    });

  const match = new RegExp(`^${source}$`).exec(str.trim());
  if (!match) return null;

  const v = { yyyy: 0, MM: 0, dd: 0, HH: 0, mm: 0, ss: 0 };
  order.forEach((token, i) => (v[token as keyof typeof v] = Number(match[i + 1])));

  if (!v.yyyy || !v.MM || !v.dd) {
    return null;
  }
  if (v.HH > 23 || v.mm > 59 || v.ss > 59) return null;

  const asUtc = new Date(Date.UTC(v.yyyy, v.MM - 1, v.dd, v.HH, v.mm, v.ss));
  // Đối chiếu lại để loại ngày không tồn tại (Date.UTC tự "tràn" sang tháng sau)
  if (
    asUtc.getUTCFullYear() !== v.yyyy ||
    asUtc.getUTCMonth() !== v.MM - 1 ||
    asUtc.getUTCDate() !== v.dd
  ) {
    return null;
  }

  return new Date(asUtc.getTime() - VN_OFFSET_MS);
}

/** 00:00:00.000 giờ VN của ngày chứa `value`. */
export function startOfDay(value: DateInput): Date | null {
  const d = toValidDate(value);
  if (!d) return null;
  const vnMs = d.getTime() + VN_OFFSET_MS;
  return new Date(Math.floor(vnMs / DAY_MS) * DAY_MS - VN_OFFSET_MS);
}

/** 23:59:59.999 giờ VN của ngày chứa `value`. */
export function endOfDay(value: DateInput): Date | null {
  const start = startOfDay(value);
  return start ? new Date(start.getTime() + DAY_MS - 1) : null;
}

/** Cộng/trừ số ngày (VN không có DST nên 1 ngày luôn là 24h). */
export function addDays(value: DateInput, days: number): Date | null {
  const d = toValidDate(value);
  return d ? new Date(d.getTime() + days * DAY_MS) : null;
}

/**
 * Số ngày lịch chênh lệch (theo giờ VN) giữa a và b, tức a - b.
 * 23:59 hôm qua và 00:01 hôm nay cách nhau 1 ngày.
 */
export function diffInDays(a: DateInput, b: DateInput): number | null {
  const sa = startOfDay(a);
  const sb = startOfDay(b);
  if (!sa || !sb) return null;
  return Math.round((sa.getTime() - sb.getTime()) / DAY_MS);
}