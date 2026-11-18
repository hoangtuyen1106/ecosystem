/**
 * Bảng ký tự tiếng Việt có dấu -> chữ cái gốc.
 * Mỗi chuỗi là các ký tự viết liền, không cần ký tự phân cách.
 */
const VIETNAMESE_MAP: Readonly<Record<string, string>> = {
  a: 'áàảãạăắặằẳẵâấầẩẫậÁÀẢÃẠĂẮẶẰẲẴÂẤẦẨẪẬ',
  d: 'đĐ',
  e: 'éèẻẽẹêếềểễệÉÈẺẼẸÊẾỀỂỄỆ',
  i: 'íìỉĩịÍÌỈĨỊ',
  o: 'óòỏõọôốồổỗộơớờởỡợÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢ',
  u: 'úùủũụưứừửữựÚÙỦŨỤƯỨỪỬỮỰ',
  y: 'ýỳỷỹỵÝỲỶỸỴ',
};

/** Ký tự có dấu -> ký tự gốc. Build một lần khi load module. */
const CHAR_LOOKUP: ReadonlyMap<string, string> = new Map(
  Object.entries(VIETNAMESE_MAP).flatMap(([base, chars]) =>
    Array.from(chars, (ch) => [ch, base] as [string, string]),
  ),
);

const ACCENT_REGEX = new RegExp(`[${Array.from(CHAR_LOOKUP.keys()).join('')}]`, 'g');

/** Các ký tự bị xóa trong formatSearchUnicode. Cần thêm ký tự nào thì sửa tại đây. */
const SPECIAL_CHARS_REGEX = /[-+().,*_]/g;

export interface FormatUnicodeOptions {
  /**
   * Chuyển toàn bộ kết quả về chữ thường.
   * Mặc định false (giữ hành vi như bản PHP gốc).
   */
  lowercase?: boolean;
}

/**
 * Bỏ dấu tiếng Việt.
 *
 * Lưu ý (giống bản PHP gốc): chữ hoa CÓ dấu đổi thành chữ thường ('Á' -> 'a'),
 * chữ hoa KHÔNG dấu giữ nguyên ('A' -> 'A'). Dùng `{ lowercase: true }` để đồng nhất.
 *
 * @example
 * formatUnicode('Nguyễn Văn Ánh');                       // 'Nguyen Van anh'
 * formatUnicode('Nguyễn Văn Ánh', { lowercase: true });  // 'nguyen van anh'
 */
export function formatUnicode(
  str?: string | null,
  options: FormatUnicodeOptions = {},
): string {
  if (!str) return '';

  // NFC: gộp ký tự tổ hợp (a + dấu huyền) thành ký tự dựng sẵn (à) để map khớp
  const result = str
    .trim()
    .normalize('NFC')
    .replace(ACCENT_REGEX, (ch) => CHAR_LOOKUP.get(ch) ?? ch);

  return options.lowercase ? result.toLowerCase() : result;
}

/**
 * Bỏ dấu + bỏ ký tự đặc biệt cho từng phần tử, bỏ phần tử rỗng, nối bằng ' | '.
 * Trả về null nếu không còn dữ liệu hợp lệ.
 *
 * @example
 * formatSearchUnicode(['Hà-Nội', 'Đà Nẵng (TP.)', null]);
 * // 'HaNoi | da Nang TP'
 */
export function formatSearchUnicode(
  data: ReadonlyArray<string | null | undefined> = [],
  options: FormatUnicodeOptions = {},
): string | null {
  const result = data
    .filter((item): item is string => !!item)
    .map((item) => formatUnicode(item, options).replace(SPECIAL_CHARS_REGEX, ''))
    .filter((item) => item.length > 0);

  return result.length > 0 ? result.join(' | ') : null;
}

/**
 * Tạo khóa tìm kiếm chuẩn cho cả team: bỏ dấu + chữ thường + bỏ ký tự đặc biệt.
 * Dùng chung một hàm cho cả lúc LƯU (cột name_search) và lúc TÌM (keyword).
 *
 * @example
 * toSearchKey(['Nguyễn Văn A', '0901-234-567']); // 'nguyen van a | 0901234567'
 */
export function toSearchKey(
  data: ReadonlyArray<string | null | undefined>,
): string | null {
  return formatSearchUnicode(data, { lowercase: true });
}