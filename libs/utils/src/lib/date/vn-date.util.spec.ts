import {
  addDays,
  diffInDays,
  endOfDay,
  formatDate,
  parseDate,
  startOfDay,
} from './vn-date.util';

// 2024-01-31T17:30:00Z = 01/02/2024 00:30 giờ VN (khác ngày so với UTC)
const SAMPLE = new Date('2024-01-31T17:30:00Z');

describe('formatDate', () => {
  it('format theo giờ VN, không phụ thuộc TZ máy', () => {
    expect(formatDate(SAMPLE)).toBe('01/02/2024');
    expect(formatDate(SAMPLE, 'dd/MM/yyyy HH:mm')).toBe('01/02/2024 00:30');
    expect(formatDate(SAMPLE, 'yyyy-MM-dd HH:mm:ss')).toBe('2024-02-01 00:30:00');
  });

  it('nhận string ISO và timestamp', () => {
    expect(formatDate('2024-01-31T17:30:00Z')).toBe('01/02/2024');
    expect(formatDate(SAMPLE.getTime())).toBe('01/02/2024');
  });

  it('input không hợp lệ -> fallback', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate('abc', 'dd/MM/yyyy', { fallback: '--' })).toBe('--');
  });
});

describe('parseDate', () => {
  it('đọc ngày theo giờ VN', () => {
    expect(parseDate('01/02/2024')?.toISOString()).toBe('2024-01-31T17:00:00.000Z');
    expect(parseDate('01/02/2024 08:30', 'dd/MM/yyyy HH:mm')?.toISOString()).toBe(
      '2024-02-01T01:30:00.000Z',
    );
  });

  it('round-trip với formatDate', () => {
    const d = parseDate('15/08/2024 23:59:58', 'dd/MM/yyyy HH:mm:ss');
    expect(formatDate(d, 'dd/MM/yyyy HH:mm:ss')).toBe('15/08/2024 23:59:58');
  });

  it('loại ngày không tồn tại', () => {
    expect(parseDate('31/02/2024')).toBeNull();
    expect(parseDate('29/02/2023')).toBeNull();
    expect(parseDate('29/02/2024')).not.toBeNull(); // năm nhuận
    expect(parseDate('00/01/2024')).toBeNull();
    expect(parseDate('01/13/2024')).toBeNull();
  });

  it('loại giờ sai và sai định dạng', () => {
    expect(parseDate('01/02/2024 24:00', 'dd/MM/yyyy HH:mm')).toBeNull();
    expect(parseDate('2024-02-01')).toBeNull();
    expect(parseDate('')).toBeNull();
    expect(parseDate(null)).toBeNull();
  });

  it('thiếu yyyy/MM/dd -> null', () => {
    expect(parseDate('08:30', 'HH:mm')).toBeNull();
  });
});

describe('startOfDay / endOfDay', () => {
  it('biên ngày theo giờ VN', () => {
    expect(startOfDay(SAMPLE)?.toISOString()).toBe('2024-01-31T17:00:00.000Z');
    expect(endOfDay(SAMPLE)?.toISOString()).toBe('2024-02-01T16:59:59.999Z');
  });

  it('input không hợp lệ -> null', () => {
    expect(startOfDay(null)).toBeNull();
    expect(endOfDay('abc')).toBeNull();
  });
});

describe('addDays', () => {
  it('cộng và trừ ngày', () => {
    expect(formatDate(addDays(SAMPLE, 30))).toBe('02/03/2024'); // 2024 nhuận
    expect(formatDate(addDays(SAMPLE, -1))).toBe('31/01/2024');
  });
});

describe('diffInDays', () => {
  it('tính theo ngày lịch', () => {
    expect(
      diffInDays('2024-02-03T00:00:00+07:00', '2024-02-01T23:59:00+07:00'),
    ).toBe(2);
    expect(diffInDays(SAMPLE, SAMPLE)).toBe(0);
    expect(diffInDays(null, SAMPLE)).toBeNull();
  });
});