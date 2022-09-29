export function uniqueId(key: string) {
  //reverse the key
  const salt = [...key].reverse().join('');

  //hash the key
  const hash = Buffer.from(`${salt + key}`).toString('base64');

  ///exclude special chars
  return hash.replace(/[^a-zA-Z0-9 ]/g, '');
}
/**
 * Check if a string has special characters
 */
export function hasSymbol(str: string) {
  // eslint-disable-next-line no-useless-escape
  const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  return specialChars.test(str);
}
/**
 * @summary utility function to escape special characters on Redis queries
 * @param {string} value
 * @return {string}
 */
export function escapeSymbol(value: string) {
  value = value.replace(':', '\\:');
  value = value.replace('_', '\\_');
  value = value.replace('-', '\\-');
  value = value.replace('@', '\\@');
  return value;
}

/**
 * @description program will sleep for x milliseconds
 * @param {number} ms
 * @returns Promise<void>
 */
function waitFor(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
