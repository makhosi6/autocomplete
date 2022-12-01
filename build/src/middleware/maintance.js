"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterLocalIPs = void 0;
const helpers_1 = require("../core/utils/helpers");
// Auth maintenance token && Lock to certain IP addr
const filterLocalIPs = (request, response, next) => {
    /**
     * used Bearer token
     */
    const token = request.headers.authorization
        ? request.headers.authorization.split(' ')[1]
        : '';
    if (token !== 'TOKEN_TWO') {
        next();
        return;
    }
    /**
     * used ip addr
     */
    const ip = (0, helpers_1.userIP)(request) || request.ip;
    /**
     * whitelist
     */
    const whiteList = [
        '::1',
        '127.0.0.1',
        'MY-IP',
        '178.79.184.57',
        '192.168.0.134',
        '192.168.0.135',
    ];
    if (whiteList.includes(ip)) {
        next();
        return;
    }
    else {
        return response.send(401);
    }
    /**
     *  if the token or IP addr is not valid
     */
};
exports.filterLocalIPs = filterLocalIPs;
