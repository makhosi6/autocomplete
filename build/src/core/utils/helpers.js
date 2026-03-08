"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indices = exports.killed = exports.isAuth = exports.getWhiteList = void 0;
exports.uniqueId = uniqueId;
exports.hasSymbol = hasSymbol;
exports.escapeSymbol = escapeSymbol;
exports.waitFor = waitFor;
exports.analytics = analytics;
exports.userIP = userIP;
exports.redisEscape = redisEscape;
const node_config_1 = require("./node.config");
require("./polyfill");
const internal_cache = require('../cache/internal');
function uniqueId(key) {
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
function hasSymbol(str) {
    // eslint-disable-next-line no-useless-escape
    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    return specialChars.test(str);
}
/**
 * @summary utility function to escape special characters on Redis queries
 * @param {string} value
 * @return {string}
 */
function escapeSymbol(value) {
    value = value.replaceAll(':', '\\:');
    // eslint-disable-next-line no-useless-escape, prettier/prettier
    value = value.replaceAll(' ', '\\ ');
    value = value.replaceAll('_', '\\_');
    value = value.replaceAll('-', '\\-');
    value = value.replaceAll('@', '\\@');
    return value;
}
/**
 * @description program will sleep for x milliseconds
 * @param {number} ms
 * @returns Promise<void>
 */
function waitFor(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
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
async function analytics(request) {
    try {
        // console.log(request);
        console.log(userIP(request));
        console.log(request.ip);
        //auth headers (using Node.js built-in fetch/Headers)
        const myHeaders = new Headers();
        myHeaders.append('Authorization', 'Bearer ' + node_config_1.ADMIN_KEY);
        myHeaders.append('Content-Type', 'application/json');
        console.log({ auth: request.headers.authorization });
        const data = {
            uuky: '_placeholder',
            x_token: request.headers.authorization
                ? String(request.headers.authorization).split(' ')[1]
                : '',
            x_ip: userIP(request),
            x_query: request.params.key || 'unknown',
            path: request.path,
            x_origin: request.url,
            x_hostname: request.hostname || '',
            timestamp: new Date().getTime(),
            x_params: JSON.stringify(request.query),
            x_rawHeaders: request.rawHeaders.toString(),
            x_body: request.body ? JSON.stringify(request.body) : '',
        };
        const res = await fetch(node_config_1.SERVICE_TWO + '/analytics', {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify(data),
        });
        console.log(JSON.stringify(data));
        console.log('\x1b[43m%s\x1b[0m', `Analytics sent! status ${res.status}`);
        console.log('Analytics');
    }
    catch (error) {
        console.log(error);
    }
}
function userIP(req) {
    const ip = req.ip;
    if (ip)
        return ip;
    return (req.headers['X-Real-IP'] || //( (Nginx proxy/FastCGI)
        req.headers['X-Forwarded-For'] || // X-Forwarded-For (Header may return multiple IP addresses in the format: "client IP, proxy 1 IP, proxy 2 IP", so we take the the first one.)
        req.headers['X-Client-IP'] ||
        req.headers['CF-Connecting-IP'] || //( (Cloudflare)
        req.headers['Fastly-Client-Ip'] || //( (Fastly CDN and Firebase hosting header when forwared to a cloud function)
        req.headers['True-Client-Ip'] || //( (Akamai and Cloudflare)
        req.headers['X-Cluster-Client-IP'] || //( (Rackspace LB, Riverbed Stingray)
        req.headers['X-Forwarded'] ||
        req.headers['Forwarded-For'] ||
        req.headers['Forwarded'] ||
        req.headers['Variations'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        req.connection?.socket?.remoteAddress ||
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        req?.info?.remoteAddress);
}
/**
 * Get a list of registered/authenticated users from the database
 * @returns Promise<Array<object>>
 *
 */
const getWhiteList = async function () {
    try {
        const myHeaders = new Headers();
        myHeaders.append('Authorization', 'Bearer ' + node_config_1.ADMIN_KEY);
        const requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow',
        };
        const response = await fetch(node_config_1.SERVICE_TWO + '/tokens', requestOptions);
        console.log('TOKENS RESPONSE', response.status);
        const data = (await response.json()) || [];
        console.log({ data });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return [...data, { token: 'TOKEN_TWO' }, { token: 'SECRET_TOKEN' }];
    }
    catch (error) {
        console.log(error);
        return [{ token: 'TOKEN_TWO' }, { token: 'SECRET_TOKEN' }];
    }
};
exports.getWhiteList = getWhiteList;
/**
 * Validate the user auth token against the stored collection of tokens
 * @param token user auth token
 * @returns {boolean}
 */
const isAuth = async (token) => {
    console.log('\x1b[43m%s\x1b[0m', '🚧🚧🚧🚧 ', token);
    const user = internal_cache.get(token);
    console.log({ foundUser: user });
    /// if user is not on the whitelist
    if (user === undefined || user === null)
        return false;
    else if (user instanceof Object)
        return true;
    console.log('\x1b[43m%s\x1b[0m', '🚧🚧🚧🚧 USER IS UNDEFINED');
    return false;
};
exports.isAuth = isAuth;
/**
 * If and when the app dies or it's stopped
 */
const killed = async () => {
    console.log('\x1b[31m%s\x1b[0m', 'PROCESS STOPPED...');
    /**
     * close  the server and the client DB  connection
     */
    global.client.quit();
    global.rateLimitRedis.disconnect();
};
exports.killed = killed;
function redisEscape(value) {
    const replacements = {
        ',': '\\,',
        '.': '\\.',
        '<': '\\<',
        '>': '\\>',
        '{': '\\{',
        '}': '\\}',
        '[': '\\[',
        ']': '\\]',
        '"': '\\"',
        "'": "\\'",
        ':': '\\:',
        ';': '\\;',
        '!': '\\!',
        '@': '\\@',
        '#': '\\#',
        $: '\\$',
        '%': '\\%',
        '^': '\\^',
        '&': '\\&',
        '*': '\\*',
        '(': '\\(',
        ')': '\\)',
        '-': '\\-',
        '+': '\\+',
        '=': '\\=',
        '~': '\\~',
    };
    const newValue = value.replace(/,|\.|<|>|\{|\}|\[|\]|"|'|:|;|!|@|#|\$|%|\^|&|\*|\(|\)|-|\+|=|~/g, x => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        return replacements[x];
    });
    return newValue;
}
/**
 *
 */
exports.indices = {
    a: 2,
    b: 3,
    c: 4,
    d: 5,
    e: 6,
    f: 7,
    g: 8,
    h: 9,
    i: 10,
    j: 11,
    k: 12,
    l: 13,
    m: 14,
    n: 15,
    o: 16,
    p: 17,
    q: 18,
    r: 19,
    s: 20,
    t: 21,
    u: 22,
    v: 23,
    w: 24,
    x: 25,
    y: 26,
    z: 27,
    0: 28,
    words_lowercase: 29,
};
//# sourceMappingURL=helpers.js.map