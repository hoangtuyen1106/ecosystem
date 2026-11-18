import { maskBankAccount, maskCccd, maskEmail, maskMiddle } from './mask.util';

describe('maskMiddle', () => {
  it('che phần giữa', () => {
    expect(maskMiddle('abcdef', { visibleStart: 2, visibleEnd: 1 })).toBe('ab***f');
    expect(maskMiddle('abcdef', { visibleEnd: 2, maskChar: '#' })).toBe('####ef');
  });

  it('chuỗi quá ngắn -> che toàn bộ', () => {
    expect(maskMiddle('abc', { visibleStart: 2, visibleEnd: 1 })).toBe('***');
  });

  it('input rỗng', () => {
    expect(maskMiddle(null)).toBe('');
    expect(maskMiddle('')).toBe('');
  });

  it('đếm đúng ký tự Unicode', () => {
    expect(maskMiddle('Nguyễn', { visibleStart: 1 })).toBe('N*****');
  });
});

describe('maskEmail', () => {
  it.each([
    ['nguyenvana@gmail.com', 'ng********@gmail.com'],
    ['abcd@x.com', 'ab**@x.com'],
    ['ab@x.com', 'a*@x.com'],
    ['a@x.com', '*@x.com'],
    ['invalid', 'in*****'],
    ['', ''],
  ])('%s -> %s', (input, expected) => {
    expect(maskEmail(input)).toBe(expected);
  });
});

describe('maskCccd', () => {
  it('giữ 4 số cuối', () => {
    expect(maskCccd('079201001234')).toBe('********1234');
    expect(maskCccd('012345678')).toBe('*****5678');
    expect(maskCccd(null)).toBe('');
  });
});

describe('maskBankAccount', () => {
  it('bỏ khoảng trắng/gạch ngang rồi giữ 4 số cuối', () => {
    expect(maskBankAccount('1234 5678 9012 3')).toBe('*********0123');
    expect(maskBankAccount('1234-5678')).toBe('****5678');
  });
});