"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("./core/controllers/http");
const client_1 = require("./core/db/client");
const app_config_1 = require("./core/utils/app.config");
const rate_limiting_config_1 = require("./core/utils/rate-limiting.config");
const { rateLimitRedis } = require('@jwerre/rate-limit-redis');
const express = require('express');
const cors = require('cors');
const queue = require('./core/queue/index');
const cache = require('./core/cache/index');
const compression = require('compression');
/// set DB client
(0, client_1.client)().then(c => (global.client = c));
// begin processing, get notified on end / failure
queue.start((err) => {
    // console.log('\x1b[36m%s\x1b[0m', 'START QUEUE!34');
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
 * Allow * Origins
 *
 */
app.use(cors());
/**
 * to return json
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
rateLimitRedis(rate_limiting_config_1.rateLimitArgs);
/**
 * middleware for all api routes
 * - authorization
 */
app.all('/api/*', async (request, response, next) => {
    const bearerHeader = request.headers.authorization;
    if (!bearerHeader) {
        return response.sendStatus(401);
    }
    else {
        const bearerToken = bearerHeader.split(' ')[1];
        console.log({ bearerToken });
        if (bearerToken !== 'THE_ONE')
            response.sendStatus(401);
        else
            next();
    }
});
/**
 * Rating
 *
 */
app.all('/api/*', async (request, response, next) => {
    /**
     * push task to the queue: lookup usage on Redis and update the Cache
     */
    queue.push(() => {
        global.rateLimitRedis
            .process(request)
            .then((result = {}) => {
            cache.set(result.ip, result, result.retry || app_config_1.TTL);
        })
            .catch(console.log);
    });
    /// use cache to get user's usage data, and throttle the user if need
    const usageData = {
        ...{
            ttl: ((cache.getTtl(request.ip) - new Date().getTime()) /
                1000).toFixed(),
        },
        ...cache.get(request.ip),
    };
    /**
     * Set headers
     */
    response.set('x-ratelimit-limit', usageData.limit || rate_limiting_config_1.rateLimitArgs.limit);
    response.set('x-ratelimit-remaining', 
    // eslint-disable-next-line eqeqeq
    usageData.remaining == 0
        ? usageData.remaining
        : String(usageData.remaining - 1 || rate_limiting_config_1.rateLimitArgs.limit - 1));
    response.set('retry-after', usageData.retry ? usageData.ttl : 0);
    console.log({ usageData });
    if ((usageData === null || usageData === void 0 ? void 0 : usageData.status) === 429) {
        response.send(usageData.status);
    }
    else {
        next();
    }
    ///
});
/**
 *  compress all requests
 *
 */
app.use(compression());
/**
 * Static files
 *
 */
app.use(express.static(__dirname + '/src/static'));
/// admin routes
app.all('/secret/*', (request, response, next) => {
    console.log('All Admin routes ...');
    const bearerHeader = request.headers.authorization;
    if (!bearerHeader) {
        response.sendStatus(403);
    }
    else {
        const bearerToken = bearerHeader.split(' ')[1];
        console.log({ bearerToken });
        if (bearerToken !== app_config_1.ADMIN_KEY)
            response.sendStatus(403);
        next();
    }
});
// auth middleware => https://www.linode.com/docs/guides/authenticating-over-websockets-with-jwt/
// go to docs
app.get('/', (req, res) => {
    res.redirect('/docs/get-started');
});
///
app.get('/home', (req, res) => {
    // res.redirect('/docs/get-started');
    // console.log();
    if (res.statusCode !== 429)
        res.send({
            said: 'Haappiee',
        });
    else
        res.send(res.statusCode);
});
// boot/create a Redis index
app.get('/secret/boot', http_1.RedisHttpController.createAnIndex);
// Get the route /
app.get('/secret/feed-data/:category', http_1.RedisHttpController.feedData);
// http search
app.get('/api/v1/autocomplete/:key', (request, response) => response.statusCode !== 429
    ? http_1.RedisHttpController.getAll(request, response)
    : response.send(response.statusCode));
app.get('/api/v2/search/autocomplete/:key', http_1.RedisHttpController.getAll);
/// If and when the app dies
process.once('exit', async () => {
    console.log('\x1b[31m%s\x1b[0m', 'PROCESS STOPPED...');
    /// the server and the client close the connection
    global.client.quit();
});
/// If and when the app dies
process.once('disconnect', async () => {
    console.log('\x1b[31m%s\x1b[0m', 'PROCESS DISCONNECTED...');
    /// the server and the client close the connection
    global.client.quit();
});
// app.listen(port, () => console.log('Running on port 3001'));
const server = app.listen(app_config_1.PORT, () => console.log('\x1b[46m%s\x1b[0m', 'Running on port 3001'));
server.on('error', () => {
    global.rateLimitRedis.disconnect();
});
/**

curl --location --request GET 'http://192.168.0.135:3001/api/v1/autocomplete/ye?limit=10&sort=DESC' \
  --header 'Authorization: Bearer THE_ONE'

 *
 */
//# sourceMappingURL=index.js.map