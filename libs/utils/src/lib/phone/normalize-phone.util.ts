/**
 * Số di động Việt Nam sau khi chuẩn hóa: 10 chữ số, bắt đầu 03, 05, 07, 08, 09.
 * Đầu số 11 chữ số cũ (016x...) đã bị bỏ từ 2018 nên không hỗ trợ.
 * Cần chặt hơn (theo từng nhà mạng) thì sửa regex tại đây.
 */
const VN_MOBILE_REGEX = /^0[35789]\d{8}$/;

/**
 * Chuẩn hóa số điện thoại VN về dạng nội địa 10 số (0xxxxxxxxx).
 * Trả về null nếu không phải số di động VN hợp lệ.
 *
 * Chấp nhận: '0901 234 567', '090-123-4567', '+84901234567',
 *            '84901234567', '0084901234567', '(0901) 234.567'
 *
 * @example
 * normalizePhone('+84 901-234-567'); // '0901234567'
 * normalizePhone('12345');           // null
 */
export function normalizePhone(phone?: string | null): string | null {
  if (!phone) return null;

  // Giữ lại chữ số; bỏ mọi ký tự khác (khoảng trắng, -, ., (), +)
  let digits = phone.replace(/\D/g, '');

  if (digits.startsWith('0084')) {
    digits = '0' + digits.slice(4);
  } else if (digits.startsWith('84') && digits.length === 11) {
    digits = '0' + digits.slice(2);
  }

  return VN_MOBILE_REGEX.test(digits) ? digits : null;
}

export function isValidPhone(phone?: string | null): boolean {
  return normalizePhone(phone) !== null;
}

/**
 * Chuyển về dạng quốc tế E.164 (+84901234567), dùng khi gửi SMS/OTP.
 *
 * @example
 * toE164Phone('0901 234 567'); // '+84901234567'
 */
export function toE164Phone(phone?: string | null): string | null {
  const local = normalizePhone(phone);
  return local ? `+84${local.slice(1)}` : null;
}

/**
 * Che số điện thoại khi hiển thị: giữ 3 số đầu và 3 số cuối.
 *
 * @example
 * maskPhone('0901234567'); // '090****567'
 */
export function maskPhone(phone?: string | null): string {
  const local = normalizePhone(phone);
  if (!local) return '';
  return `${local.slice(0, 3)}****${local.slice(-3)}`;
}