import {
  isValidPhone,
  maskPhone,
  normalizePhone,
  toE164Phone,
} from './normalize-phone.util';

describe('normalizePhone', () => {
  it.each([
    ['0901234567', '0901234567'],
    ['0901 234 567', '0901234567'],
    ['090-123-4567', '0901234567'],
    ['(0901) 234.567', '0901234567'],
    ['+84901234567', '0901234567'],
    ['+84 901 234 567', '0901234567'],
    ['84901234567', '0901234567'],
    ['0084901234567', '0901234567'],
  ])('%s -> %s', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it.each([null, undefined, '', '12345', '0201234567', '090123456', '09012345678', 'abc'])(
    'không hợp lệ: %s -> null',
    (input) => {
      expect(normalizePhone(input as string)).toBeNull();
    },
  );
});

describe('isValidPhone', () => {
  it('đúng / sai', () => {
    expect(isValidPhone('0901234567')).toBe(true);
    expect(isValidPhone('123')).toBe(false);
  });
});

describe('toE164Phone', () => {
  it('chuyển sang +84', () => {
    expect(toE164Phone('0901 234 567')).toBe('+84901234567');
    expect(toE164Phone('abc')).toBeNull();
  });
});

describe('maskPhone', () => {
  it('che giữa', () => {
    expect(maskPhone('0901234567')).toBe('090****567');
    expect(maskPhone('abc')).toBe('');
  });
});