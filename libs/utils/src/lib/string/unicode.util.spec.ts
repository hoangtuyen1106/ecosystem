import { formatSearchUnicode, formatUnicode, toSearchKey } from './unicode.util';

describe('formatUnicode', () => {
  it('trả về chuỗi rỗng khi input rỗng', () => {
    expect(formatUnicode(null)).toBe('');
    expect(formatUnicode(undefined)).toBe('');
    expect(formatUnicode('')).toBe('');
  });

  it('trim khoảng trắng hai đầu', () => {
    expect(formatUnicode('  Hà Nội  ')).toBe('Ha Noi');
  });

  it('bỏ dấu; chữ hoa có dấu thành chữ thường (giống PHP)', () => {
    expect(formatUnicode('Nguyễn Văn Ánh')).toBe('Nguyen Van anh');
  });

  it('lowercase toàn bộ khi bật option', () => {
    expect(formatUnicode('Nguyễn Văn Ánh', { lowercase: true })).toBe('nguyen van anh');
  });

  it('xử lý đ/Đ', () => {
    expect(formatUnicode('Đường đi', { lowercase: true })).toBe('duong di');
  });

  it('xử lý chữ có dấu dạng tổ hợp (NFD)', () => {
    expect(formatUnicode('Ha\u0300 No\u0323\u0302i')).toBe('Ha Noi');
  });

  it('giữ nguyên ký tự không phải tiếng Việt', () => {
    expect(formatUnicode('ABC 123 !@#')).toBe('ABC 123 !@#');
  });
});

describe('formatSearchUnicode', () => {
  it('bỏ ký tự đặc biệt và nối bằng " | "', () => {
    expect(formatSearchUnicode(['Hà-Nội', 'Đà Nẵng (TP.)', null, ''])).toBe(
      'HaNoi | da Nang TP',
    );
  });

  it('loại phần tử rỗng sau khi xóa ký tự đặc biệt', () => {
    expect(formatSearchUnicode(['-', 'abc'])).toBe('abc');
  });

  it('trả về null khi không có dữ liệu hợp lệ', () => {
    expect(formatSearchUnicode([null, '', undefined])).toBeNull();
    expect(formatSearchUnicode()).toBeNull();
  });
});

describe('toSearchKey', () => {
  it('bỏ dấu + chữ thường + bỏ ký tự đặc biệt', () => {
    expect(toSearchKey(['Nguyễn Văn A', '0901-234-567'])).toBe(
      'nguyen van a | 0901234567',
    );
  });
});