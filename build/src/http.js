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
// import {WebSocket} from 'ws';
const http_1 = require("./core/controllers/http");
const client_1 = require("./core/db/client");
const node_config_1 = require("./core/utils/node.config");
const helpers_1 = require("./core/utils/helpers");
const harmony_config_1 = require("./core/utils/harmony.config");
const { rateLimitRedis } = require('@jwerre/rate-limit-redis');
const express = require('express');
const cors = require('cors');
const queue = require('./core/queue/index');
const cache = require('./core/cache/external');
const internal_cache = require('./core/cache/internal');
const compression = require('compression');
/// set DB client
(0, client_1.client)().then(c => (global.client = c));
/// get whitelist
// to store locally
(0, helpers_1.getWhiteList)().then(users => users.map(user => internal_cache.set(
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
user.token, user)));
// begin processing, get notified on end / failure
queue.start((err) => {
    if (err)
        throw err;
    console.log('\x1b[36m%s\x1b[0m', 'All done:', queue.results);
});
// App and server
const app = express();
/*******************
 *  MIDDLEWARES
 *
 *****************/
/**
 * Allow All Origins
 *
 */
app.use(cors());
/**
 * to return json data type
 */
app.use(express.json());
/**
 * use trust proxy if behind load balancer
 */
app.enable('trust proxy');
/**
 * initialize and configure rate limiting data/service
 *  - backed by Redis
 */
rateLimitRedis(harmony_config_1.rateLimitArgs);
/**
 * analytics
 *
 */
app.use((request, response, next) => {
    queue.push(() => (0, helpers_1.analytics)(request));
    next();
});
/**
 * middleware for all api routes
 * - authorization
 */
app.all('/api/*', (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    const bearerHeader = request.headers.authorization;
    /**
     * ddn't provide a key/token
     */
    if (!bearerHeader) {
        return response.sendStatus(400);
    }
    else {
        const bearerToken = bearerHeader.split(' ')[1];
        console.log({ bearerToken });
        /// passed an empty token
        if (!bearerToken)
            return response.sendStatus(400);
        /**
         * If the token is valid
         */
        if (yield (0, helpers_1.isAuth)(bearerToken))
            next();
        /**
         * else go through
         */ else
            response.sendStatus(401);
    }
}));
/**
 * Rating
 *
 */
app.all('/api/*', (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    /**
     * push task to the queue: lookup usage on Redis and update the Cache
     */
    queue.push(() => {
        global.rateLimitRedis
            .process(request)
            .then((result = {}) => {
            console.log({ result });
            cache.set(result.ip, result, result.retry || node_config_1.TTL);
        })
            .catch(console.log);
    });
    // console.log((global as any).rateLimitRedis);
    /// use cache to get user's usage data, and throttle the user if needed
    const usageData = Object.assign({
        ttl: ((cache.getTtl((0, helpers_1.userIP)(request)) - new Date().getTime()) /
            1000).toFixed(),
    }, cache.get((0, helpers_1.userIP)(request)));
    /**
     * Set headers
     */
    response.set('x-ratelimit-limit', usageData.limit || harmony_config_1.rateLimitArgs.limit);
    response.set('x-ratelimit-remaining', 
    // eslint-disable-next-line eqeqeq
    usageData.remaining == 0
        ? usageData.remaining
        : String(usageData.remaining - 1 || harmony_config_1.rateLimitArgs.limit - 1));
    response.set('retry-after', usageData.retry ? usageData.ttl : 0);
    console.log({ usageData });
    /**
     * flag if the ip address is not consistent
     */
    if ((usageData === null || usageData === void 0 ? void 0 : usageData.ip) !== (0, helpers_1.userIP)(request) && usageData.ip)
        console.log('\x1b[43m%s\x1b[0m', `${usageData.ip} VS ${(0, helpers_1.userIP)(request)}`);
    /**
     * user has exceeded the usage limit
     */
    if ((usageData === null || usageData === void 0 ? void 0 : usageData.status) === 429) {
        response.send(usageData.status);
    }
    else {
        /// else go through
        next();
    }
}));
/**
 *  compress all requests
 *
 */
app.use(compression());
/**
 * Static files
 */
app.use(express.static(__dirname + '/static'));
/**
 *  admin and maintenance routes, All hide behind a the ADMIN_KEY
 *
 */
app.all('/secret/*', (request, response, next) => {
    const bearerHeader = request.headers.authorization;
    /**
     * Flag usage of all admin routes
     */
    console.log('\x1b[41m%s\x1b[0m', 'All Admin routes ...', 'USED TOKEN IS' + bearerHeader);
    /**
     * if the token is not included
     */
    if (!bearerHeader) {
        response.sendStatus(403);
    }
    else {
        const bearerToken = bearerHeader.split(' ')[1];
        console.log({ bearerToken });
        if (bearerToken !== node_config_1.ADMIN_KEY) {
            /**
             *  if the token is not valid
             */
            response.sendStatus(403);
        }
        else {
            // if the token is valid
            next();
        }
    }
});
app.get('/', (req, res) => {
    res.redirect('/docs/get-started');
});
///
app.get('/home', (req, res) => {
    res.redirect('/docs/get-started');
});
// boot/create a Redis index
app.get('/secret/boot', http_1.RedisHttpController.createAnIndex);
// Update the authrized token/key list
app.post('/secret/whitelist', (request, response) => {
    try {
        console.log('Whitelist Updated');
        /// user auth infor
        const body = request.body;
        /// update internal white list store
        internal_cache.set(body.token, body);
        console.log(internal_cache.getStats());
        response.send(201);
    }
    catch (error) {
        response.send(500);
    }
});
// Update the authrized token/key list
app.delete('/secret/whitelist/', (request, response) => {
    try {
        console.log('Whitelist Updated');
        /// user auth infor
        const body = request.body;
        /// update internal white list store
        internal_cache.take(body.token);
        console.log(internal_cache.getStats());
        response.send(201);
    }
    catch (error) {
        response.send(500);
    }
});
// // Update the authrized token/key list
// app.post('/secret/whitelist', (request: Request, response: Response) => {
//   response.send('Whitelist Updated');
// });
// Get the route /
app.get('/secret/feed-data/:category', http_1.RedisHttpController.feedData);
/// addd new token
app.get('/secret/feed-data/:category', http_1.RedisHttpController.feedData);
/// remove token
app.get('/secret/feed-data/:category', http_1.RedisHttpController.feedData);
// http search
app.get('/api/v1/autocomplete/:key', (request, response) => response.statusCode !== 429
    ? http_1.RedisHttpController.getAll(request, response)
    : response.send(response.statusCode));
app.get('/api/v2/search/autocomplete/:key', http_1.RedisHttpController.getAll);
/// If and when the app dies
process.once('exit', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('\x1b[31m%s\x1b[0m', 'PROCESS STOPPED...');
    /// the server and the client close the connection
    global.client.quit();
    global.rateLimitRedis.disconnect();
}));
/// If and when the app dies
process.once('disconnect', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('\x1b[31m%s\x1b[0m', 'PROCESS DISCONNECTED...');
    /// the server and the client close the connection
    global.client.quit();
    global.rateLimitRedis.disconnect();
}));
const server = app.listen(node_config_1.PORT, () => console.log('\x1b[46m%s\x1b[0m', 'Running on port 3001'));
console.log({
    maxConnections: server.maxConnections,
    getMaxListeners: server.getMaxListeners(),
    address: server.address(),
});
server.on('connection', s => {
    console.log('Connections  => ', server.connections, ' ', s.remoteAddress, '', s.localAddress);
});
server.on('error', () => {
    global.client.quit();
    global.rateLimitRedis.disconnect();
});
/**

curl --location --request GET 'http://192.168.0.135:3001/api/v1/autocomplete/ye?limit=10&sort=DESC' \
  --header 'Authorization: Bearer THE_ONE'

 *
 */
