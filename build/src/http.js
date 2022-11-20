"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import {WebSocket} from 'ws';
const client_1 = require("./core/db/client");
const node_config_1 = require("./core/utils/node.config");
const helpers_1 = require("./core/utils/helpers");
const harmony_config_1 = require("./core/utils/harmony.config");
const analytics_1 = require("./middleware/analytics");
const secret_1 = require("./routes/secret");
const api_1 = require("./routes/api");
const { rateLimitRedis } = require('rate-limit-redis');
const express = require('express');
const cors = require('cors');
const queue = require('./core/queue/index');
const internal_cache = require('./core/cache/internal');
const compression = require('compression');
const logger = require('morgan');
const path = require('path');
const rfs = require('rotating-file-stream');
/**
 * set DB client
 *
 */
(0, client_1.client)().then(c => (global.client = c));
/**
 * on boot:
 * get whitelist and store it locally on the cache
 */
(0, helpers_1.getWhiteList)().then(users => users.map(user => internal_cache.set(
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
user.token, user)));
/**
 * begin processing, get notified on end / failure
 */
queue.start((err) => {
    if (err)
        throw err;
    console.log('\x1b[36m%s\x1b[0m', 'All done:', queue.results);
});
/**
 *  App and server
 */
const app = express();
/**
 *
 * Logger
 */
// create a rotating write stream
const accessLogStream = rfs.createStream('access.log', {
    interval: '1d',
    path: path.join(__dirname, 'log'),
});
// setup the logger
app.use((req, res, next) => {
    queue.push(() => logger('combined', { stream: accessLogStream })(req, res, () => { }));
    next();
});
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
 * remove express meta data
 */
app.disable('x-powered-by');
/**
 * use trust proxy if behind load balancer/reverse proxy
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
app.use(analytics_1.analyticsHandler);
/**
 *  compress all requests
 *
 */
app.use(compression());
/**
 * Static files
 */
console.log(__dirname);
app.use('/static', express.static(path.join(__dirname, '/static')));
// hidden security files
app.use('/', express.static(path.join(__dirname, '/security')));
/**
 * Register routes
 */
app.all('/api/v1/*', api_1.default);
app.all('/secret/*', secret_1.default);
/**
 * Home routes
 */
app.get('/', (req, res) => {
    res.redirect('https://byteestudio.com/');
});
app.get('/home', (req, res) => {
    res.redirect('https://byteestudio.com/');
});
/**
 *  App and server
 */
const server = app.listen(node_config_1.PORT, () => console.log('\x1b[46m%s\x1b[0m', 'Running on port 3001'));
/**
 *
 * @param socket
 */
const onConnEv = (socket) => {
    console.log('Connections  => ', server.connections, ' ', socket.remoteAddress, '', socket.localAddress);
};
/**
 * App/Server initialized, Log just to confirm
 */
server.on('connection', onConnEv);
/**
 * If the app/server dies
 */
server.on('error', helpers_1.killed);
/**
 * If and when the app dies
 */
process.once('exit', helpers_1.killed);
/**
 *  If and when the app dies
 */
process.once('disconnect', helpers_1.killed);
/// CERTIFICATES
// https://www.namecheap.com/support/knowledgebase/article.aspx/9705/33/installing-an-ssl-certificate-on-nodejs/
// https://javascript.plainenglish.io/generate-ssl-certificate-using-node-js-for-web-apps-73d452ad5898
