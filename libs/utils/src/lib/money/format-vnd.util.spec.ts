import { formatVnd, parseVnd } from './format-vnd.util';

describe('formatVnd', () => {
  it('phân cách hàng nghìn', () => {
    expect(formatVnd(0)).toBe('0đ');
    expect(formatVnd(999)).toBe('999đ');
    expect(formatVnd(1000)).toBe('1.000đ');
    expect(formatVnd(1500000)).toBe('1.500.000đ');
  });

  it('làm tròn và xử lý số âm', () => {
    expect(formatVnd(-2500.6)).toBe('-2.501đ');
    expect(formatVnd(-0.4)).toBe('0đ'); // không ra "-0đ"
  });

  it('nhận chuỗi số', () => {
    expect(formatVnd('1200000')).toBe('1.200.000đ');
  });

  it('input không hợp lệ -> fallback', () => {
    expect(formatVnd(null)).toBe('');
    expect(formatVnd(undefined, { fallback: '--' })).toBe('--');
    expect(formatVnd('abc')).toBe('');
    expect(formatVnd(NaN)).toBe('');
    expect(formatVnd(Infinity)).toBe('');
  });

  it('tùy chỉnh hậu tố', () => {
    expect(formatVnd(1000, { suffix: ' ₫' })).toBe('1.000 ₫');
    expect(formatVnd(1000, { suffix: '' })).toBe('1.000');
  });
});

describe('parseVnd', () => {
  it('đọc ngược chuỗi tiền', () => {
    expect(parseVnd('1.500.000đ')).toBe(1500000);
    expect(parseVnd('-2.501đ')).toBe(-2501);
  });

  it('không hợp lệ -> null', () => {
    expect(parseVnd('abc')).toBeNull();
    expect(parseVnd(null)).toBeNull();
  });
});