"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitArgs = void 0;
exports.rateLimitArgs = {
    redis: {
        url: 'redis://redis-12572.c256.us-east-1-2.ec2.cloud.redislabs.com:12572/0',
        username: 'dev-user',
        password: 'ssIMTp9IwKoOiR7l7YXWdV7C98wMSHnc23@',
        database: 'reddy-r43233-322',
        no_ready_check: true,
        auth_pass: 'ssIMTp9IwKoOiR7l7YXWdV7C98wMSHnc23@',
    },
    timeframe: 60,
    limit: 2,
    headers: true,
    whitelist: ['192.168.20.20'],
    customRoutes: [
        {
            path: '/secret/boot',
            method: 'GET',
            timeframe: 60,
            limit: 2,
        },
        {
            path: '/loose/rate/limit',
            method: 'PUT',
            timeframe: 60,
            limit: 2,
        },
        {
            path: /^\/regex\/[0-9]{5,10}\/?$/,
            method: 'GET',
            timeframe: 60,
            limit: 2,
        },
        {
            path: '/',
            method: 'GET',
            ignore: true,
        },
        {
            path: '/home',
            method: 'GET',
            ignore: true,
        },
    ],
};
//# sourceMappingURL=rate-limiting.config.js.map