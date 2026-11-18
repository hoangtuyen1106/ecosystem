export interface FormatVndOptions {
  /** Hậu tố hiển thị. Mặc định 'đ'. Truyền '' để chỉ lấy số. */
  suffix?: string;
  /** Giá trị trả về khi input không hợp lệ (null, NaN...). Mặc định ''. */
  fallback?: string;
}

/**
 * Định dạng số tiền VND: dấu chấm phân cách hàng nghìn, làm tròn về số nguyên.
 * Tự cài đặt thay vì dùng Intl để kết quả giống nhau trên mọi môi trường (ICU).
 *
 * @example
 * formatVnd(1500000);                    // '1.500.000đ'
 * formatVnd(-2500.6);                    // '-2.501đ'
 * formatVnd('1200000', { suffix: ' ₫' }) // '1.200.000 ₫'
 * formatVnd(null, { fallback: '--' });   // '--'
 */
export function formatVnd(
  value?: number | string | null,
  options: FormatVndOptions = {},
): string {
  const { suffix = 'đ', fallback = '' } = options;

  if (value === null || value === undefined || value === '') return fallback;

  const num = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(num)) return fallback;

  const rounded = Math.round(Math.abs(num));
  const sign = num < 0 && rounded !== 0 ? '-' : '';
  const body = String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${sign}${body}${suffix}`;
}

/**
 * Đọc ngược chuỗi tiền VND về số.
 *
 * @example
 * parseVnd('1.500.000đ'); // 1500000
 * parseVnd('abc');        // null
 */
export function parseVnd(str?: string | null): number | null {
  if (!str) return null;
  const negative = /^\s*-/.test(str);
  const digits = str.replace(/\D/g, '');
  if (!digits) return null;
  const num = Number(digits);
  return negative ? -num : num;
}