import { slugify } from './slugify.util';

describe('slugify', () => {
  it('rỗng -> chuỗi rỗng', () => {
    expect(slugify(null)).toBe('');
    expect(slugify('')).toBe('');
  });

  it('bỏ dấu, thường hóa, nối bằng "-"', () => {
    expect(slugify('Hà Nội - Đà Nẵng!')).toBe('ha-noi-da-nang');
  });

  it('gộp nhiều ký tự đặc biệt liên tiếp', () => {
    expect(slugify('  A   &&  B  ')).toBe('a-b');
  });

  it('hỗ trợ separator tùy chọn', () => {
    expect(slugify('Áo thun nam', { separator: '_' })).toBe('ao_thun_nam');
  });

  it('cắt theo maxLength và không để dư separator cuối', () => {
    expect(slugify('Áo thun nam cao cấp', { maxLength: 8 })).toBe('ao-thun');
  });

  it('chỉ có ký tự đặc biệt -> rỗng', () => {
    expect(slugify('---!!!')).toBe('');
  });
});