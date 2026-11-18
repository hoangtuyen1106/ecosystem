import { formatUnicode } from './unicode.util';

export interface SlugifyOptions {
  /** Ký tự nối giữa các từ. Mặc định '-'. */
  separator?: string;
  /** Giới hạn độ dài slug (cắt ở ranh giới, không để dư separator cuối). */
  maxLength?: number;
}

/**
 * Chuyển chuỗi tiếng Việt thành slug cho URL.
 *
 * @example
 * slugify('Hà Nội - Đà Nẵng!');                 // 'ha-noi-da-nang'
 * slugify('Áo thun nam', { separator: '_' });   // 'ao_thun_nam'
 */
export function slugify(
  str?: string | null,
  options: SlugifyOptions = {},
): string {
  const { separator = '-', maxLength } = options;
  if (!str) return '';

  // Escape separator để dùng an toàn trong RegExp
  const sep = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  let slug = formatUnicode(str, { lowercase: true })
    .replace(/[^a-z0-9]+/g, separator)
    .replace(new RegExp(`^(?:${sep})+|(?:${sep})+$`, 'g'), '');

  if (maxLength && slug.length > maxLength) {
    slug = slug
      .slice(0, maxLength)
      .replace(new RegExp(`(?:${sep})+$`), '');
  }
  return slug;
}