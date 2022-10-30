"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetch = exports.isAuth = exports.getWhiteList = exports.userIP = exports.analytics = exports.waitFor = exports.escapeSymbol = exports.hasSymbol = exports.uniqueId = void 0;
const node_config_1 = require("./node.config");
const { Headers } = require('node-fetch');
// import {Headers} from 'node-fetch';
const internal_cache = require('../cache/internal');
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
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // console.log(request);
            console.log(userIP(request));
            //auth headers
            const myHeaders = new Headers();
            myHeaders.append('Authorization', 'Bearer ' + node_config_1.ADMIN_KEY);
            const res = yield (0, exports.fetch)(node_config_1.SERVICE_TWO + '/analytics', {
                method: 'POST',
                headers: myHeaders,
                body: JSON.stringify({
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    token: request.headers.authorization.split(' ')[1] || '',
                    x_ip: userIP(request),
                    x_query: request.params.key,
                    x_hostname: request.hostname || '',
                    timestamp: new Date().getTime(),
                    x_params: JSON.stringify(request.query),
                    x_rawHeaders: request.rawHeaders.toString(),
                    x_body: request.body ? JSON.stringify(request.body) : '',
                }),
            });
            console.log(JSON.stringify({
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                token: request.headers.authorization.split(' ')[1] || '',
                x_ip: userIP(request),
                x_query: request.params.key,
                x_hostname: request.hostname || '',
                timestamp: new Date().getTime(),
                x_params: JSON.stringify(request.query),
                x_rawHeaders: request.rawHeaders.toString(),
                x_body: request.body ? JSON.stringify(request.body) : '',
            }));
            console.log('\x1b[43m%s\x1b[0m', `Analytics sent! status ${res.status}`);
            console.log('Analytics');
        }
        catch (error) {
            console.log(error);
        }
    });
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
const getWhiteList = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const myHeaders = new Headers();
            myHeaders.append('Authorization', 'Bearer ' + node_config_1.ADMIN_KEY);
            const requestOptions = {
                method: 'GET',
                headers: myHeaders,
                redirect: 'follow',
            };
            const response = yield (0, exports.fetch)(node_config_1.SERVICE_TWO + '/tokens', requestOptions);
            // console.log('TOKENS RESPONSE', await response.text());
            const data = yield response.json();
            console.log({ data });
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return data;
        }
        catch (error) {
            console.log(error);
            return [];
        }
    });
};
exports.getWhiteList = getWhiteList;
/**
 * Validate the user auth token against the stored collection of tokens
 * @param token user auth token
 * @returns {boolean}
 */
const isAuth = (token) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.isAuth = isAuth;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const fetch = (...args) => 
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Promise.resolve().then(() => require('node-fetch')).then(({ default: fetch }) => fetch(...args));
exports.fetch = fetch;
