"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uniqueId = void 0;
const https = require('https'), fs = require('fs'), events = require('events');
const { v4: uuidv4 } = require('uuid');
// let err = [https, fs, events, uuidv4];
function uniqueId(key) {
    //reverse the key
    const salt = [...key].reverse().join('');
    //hash the key
    const hash = Buffer.from(`${salt + key}`).toString('base64');
    ///exclude special chars
    return hash.replace(/[^a-zA-Z0-9 ]/g, '');
}
exports.uniqueId = uniqueId;
//# sourceMappingURL=index.js.map