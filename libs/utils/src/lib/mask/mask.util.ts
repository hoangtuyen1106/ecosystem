export interface MaskMiddleOptions {
  /** Số ký tự giữ lại ở đầu. Mặc định 0. */
  visibleStart?: number;
  /** Số ký tự giữ lại ở cuối. Mặc định 0. */
  visibleEnd?: number;
  /** Ký tự che. Mặc định '*'. */
  maskChar?: string;
}

/**
 * Che phần giữa của chuỗi. Nếu chuỗi quá ngắn (<= số ký tự được giữ) thì che toàn bộ,
 * để không vô tình lộ cả chuỗi.
 *
 * @example
 * maskMiddle('abcdef', { visibleStart: 2, visibleEnd: 1 }); // 'ab***f'
 * maskMiddle('abc', { visibleStart: 2, visibleEnd: 1 });    // '***'
 */
export function maskMiddle(
  str?: string | null,
  options: MaskMiddleOptions = {},
): string {
  const { visibleStart = 0, visibleEnd = 0, maskChar = '*' } = options;
  if (!str) return '';

  const chars = Array.from(str); // an toàn với ký tự Unicode nhiều byte
  if (chars.length <= visibleStart + visibleEnd) {
    return maskChar.repeat(chars.length);
  }

  const head = chars.slice(0, visibleStart).join('');
  const tail = visibleEnd > 0 ? chars.slice(-visibleEnd).join('') : '';
  const hidden = maskChar.repeat(chars.length - visibleStart - visibleEnd);

  return `${head}${hidden}${tail}`;
}

/**
 * Che email: giữ 2 ký tự đầu của phần local (1 ký tự nếu local <= 3), giữ nguyên domain.
 *
 * @example
 * maskEmail('nguyenvana@gmail.com'); // 'ng********@gmail.com'
 * maskEmail('ab@x.com');             // 'a*@x.com'
 */
export function maskEmail(email?: string | null): string {
  if (!email) return '';

  const at = email.lastIndexOf('@');
  if (at <= 0) return maskMiddle(email, { visibleStart: 2 });

  const local = email.slice(0, at);
  const domain = email.slice(at);
  const visible = Array.from(local).length <= 3 ? 1 : 2;

  return `${maskMiddle(local, { visibleStart: visible })}${domain}`;
}

/**
 * Che số CCCD (12 số) / CMND (9 số): chỉ giữ 4 số cuối.
 *
 * @example
 * maskCccd('079201001234'); // '********1234'
 */
export function maskCccd(id?: string | null): string {
  if (!id) return '';
  return maskMiddle(id.replace(/\s/g, ''), { visibleEnd: 4 });
}

/**
 * Che số tài khoản ngân hàng / số thẻ: chỉ giữ 4 số cuối.
 *
 * @example
 * maskBankAccount('1234 5678 9012 3'); // '*********0123'
 */
export function maskBankAccount(account?: string | null): string {
  if (!account) return '';
  return maskMiddle(account.replace(/[\s-]/g, ''), { visibleEnd: 4 });
}