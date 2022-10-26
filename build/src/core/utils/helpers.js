"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuth = exports.getWhiteList = exports.userIP = exports.analytics = exports.waitFor = exports.escapeSymbol = exports.hasSymbol = exports.uniqueId = void 0;
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
/**
 * @description program will sleep for x milliseconds
 * @param {number} ms
 * @returns Promise<void>
 */
function waitFor(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.waitFor = waitFor;
/**
 * @description Get incoming requests and send analytics to the server \n
 * @sumamary **Data recorded**
 *  - hostname
 *  - query
 *  - pathname
 *  -  path
 *  - query data
 *  - ip
 *  - token
 *  - time
 *  - useragent
 *  - body
 * - rawHeaders as Array
 * -
 *
 * @param {Request} request
 *
 */
function analytics(request) {
    // console.log(request);
    console.log(userIP(request));
    console.log('Analytics');
}
exports.analytics = analytics;
function userIP(req) {
    var _a, _b, _c;
    return (req.headers['X-Client-IP'] ||
        req.headers['X-Forwarded-For'] || // X-Forwarded-For (Header may return multiple IP addresses in the format: "client IP, proxy 1 IP, proxy 2 IP", so we take the the first one.)
        req.headers['CF-Connecting-IP'] || //( (Cloudflare)
        req.headers['Fastly-Client-Ip'] || //( (Fastly CDN and Firebase hosting header when forwared to a cloud function)
        req.headers['True-Client-Ip'] || //( (Akamai and Cloudflare)
        req.headers['X-Real-IP'] || //( (Nginx proxy/FastCGI)
        req.headers['X-Cluster-Client-IP'] || //( (Rackspace LB, Riverbed Stingray)
        req.headers['X-Forwarded'] ||
        req.headers['Forwarded-For'] ||
        req.headers['Forwarded'] ||
        req.headers['Variations'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        (_b = (_a = req.connection) === null || _a === void 0 ? void 0 : _a.socket) === null || _b === void 0 ? void 0 : _b.remoteAddress) ||
        (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        (_c = req === null || req === void 0 ? void 0 : req.info) === null || _c === void 0 ? void 0 : _c.remoteAddress));
}
exports.userIP = userIP;
/**
 * Get a list of registered/authenticated users from the database
 * @returns Promise<Array<object>>
 *
 */
const getWhiteList = async function () {
    return [];
};
exports.getWhiteList = getWhiteList;
/**
 * Validate the user auth token against the stored collection of tokens
 * @param token user auth token
 * @returns {boolean}
 */
const isAuth = async (token) => {
    return token !== '';
};
exports.isAuth = isAuth;
//# sourceMappingURL=helpers.js.map