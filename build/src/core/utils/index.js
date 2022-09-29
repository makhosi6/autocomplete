"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeSymbol = exports.hasSymbol = exports.uniqueId = void 0;
function uniqueId(key) {
    //reverse the key
    const salt = [...key].reverse().join('');
    //hash the key
    const hash = Buffer.from(`${salt + key}`).toString('base64');
    ///exclude special chars
    return hash.replace(/[^a-zA-Z0-9 ]/g, '');
}
exports.uniqueId = uniqueId;
/**
 * Check if a string has special characters
 */
function hasSymbol(str) {
    // eslint-disable-next-line no-useless-escape
    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    return specialChars.test(str);
}
exports.hasSymbol = hasSymbol;
/**
 * @summary utility function to escape special characters on Redis queries
 * @param {string} value
 * @return {string}
 */
function escapeSymbol(value) {
    value = value.replace(':', '\\:');
    value = value.replace('_', '\\_');
    value = value.replace('-', '\\-');
    value = value.replace('@', '\\@');
    return value;
}
exports.escapeSymbol = escapeSymbol;
//# sourceMappingURL=index.js.map