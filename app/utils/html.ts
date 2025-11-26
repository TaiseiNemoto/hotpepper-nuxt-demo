/**
 * HTML文字列をエスケープしてXSS攻撃を防ぐ
 *
 * @param str - エスケープする文字列
 * @returns エスケープされた文字列
 *
 * @example
 * ```typescript
 * const safe = escapeHtml('<script>alert("XSS")</script>')
 * // => '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
 * ```
 */
export const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
