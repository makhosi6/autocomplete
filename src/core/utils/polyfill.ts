interface String {
  replaceAll(pattern: string | RegExp, replacement: string): string;
}
interface Array<T> {
  sortBy(pattern: string): Array<T>;
}
/**
 * @example
 * let str = "a random string"
 * str.replaceAll(" ","") //"arandomstring"
 * str.replaceAll("n","N") //"a raNdom striNg"
 */
String.prototype.replaceAll = function replaceAll(pattern, replacement) {
  const rgx = new RegExp(pattern, 'g');
  return this.valueOf().replace(rgx, replacement);
};
/**
 *  @description Sort items in an by their relevancy to pattern
 *  @param {String} pattern
 */
Array.prototype.sortBy = function sortBy(pattern: string): Array<unknown> {
  /**
   * sanitize param
   */
  const val = pattern.replace(/^\s+|\s+$/, '');

  // use Sorter class from the relevancy package
  const sorter = require('relevancy').Sorter({}, this.valueOf());

  //sort by value
  return sorter.sortBy(val);
};
