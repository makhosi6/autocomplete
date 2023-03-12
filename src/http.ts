import {filterLocalIPs} from './middleware/maintance';
import {Application, Request, Response} from 'express';
// import {WebSocket} from 'ws';
import {client} from './core/db/client';
import {PORT} from './core/utils/node.config';
import {getWhiteList, killed, userIP} from './core/utils/helpers';
import {rateLimitArgs, localIPaddrs} from './core/utils/harmony.config';
import {analyticsHandler} from './middleware/analytics';
import secret from './routes/secret';
import api from './routes/api';
const {rateLimitRedis} = require('rate-limit-redis');
import './core/utils/polyfill';
const express = require('express');
const cors = require('cors');
const queue = require('./core/queue/index');
const internal_cache = require('./core/cache/internal');
const compression = require('compression');
const logger = require('morgan');
const path = require('path');
const rfs = require('rotating-file-stream');

console.log(__dirname);
/**
 * set DB client
 *
 */
client().then(_client => ((global as any).client = _client));

/**
 * on boot:
 * get whitelist and store it locally on the cache
 */
getWhiteList().then(users =>
  users.map(user =>
    internal_cache.set(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      user.token,
      user
    )
  )
);

/**
 * begin processing, get notified on end / failure
 */
queue.start((err: any) => {
  if (err) throw err;
  console.log('\x1b[36m%s\x1b[0m', 'All done:', queue.results);
});

/**
 *  App and server
 */
const app: Application = express();

/**
 *
 * Logger
 */
// create a rotating write stream
const accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, 'log'),
});

// setup the logger
app.use((req, res, next) => {
  queue.push(() =>
    logger('combined', {stream: accessLogStream})(req, res, () => {})
  );
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
rateLimitRedis(rateLimitArgs);

/**
 * analytics
 *
 */
app.use(analyticsHandler);

/**
 *  compress all requests
 *
 */
app.use(compression());

/**
 * Static files
 */

app.use('/static', express.static(path.join(__dirname, '/static')));

// hidden security files
app.use('/', express.static(path.join(__dirname, '/security')));
/**
 * Register routes
 */
app.all('/api/v1/*', api);
app.all('/secret/*', secret);
/**
 * Auth maintenance token && Lock to certain IP addr
 */

app.all('/api/v1/*', filterLocalIPs);
/**
 * Home routes
 */
app.get('/', (req: Request, res: Response) => {
  res.redirect('https://byteestudio.com/');
});
app.get('/home', (req: Request, res: Response) => {
  res.redirect('https://byteestudio.com/');
});
// examples
app.get('/examples/http', (req: Request, res: Response) => {
  res.sendFile('index.html', {root: '/app/examples/http'});
});
app.get('/examples/ws', (req: Request, res: Response) => {
  res.sendFile('index.html', {root: '/app/examples/ws'});
});
/**
 *  App and server
 */
const server = app.listen(PORT, () =>
  console.log('\x1b[46m%s\x1b[0m', 'Running on port 3001')
);
/**
 *
 * @param socket
 */
const onConnEv = (socket: any) => {
  console.log(
    'Connections  => ',
    server.connections,
    ' ',
    socket.remoteAddress,
    ' ',
    socket.localAddress
  );
};

/**
 * App/Server initialized, Log just to confirm
 */
server.on('connection', onConnEv);
/**
 * If the app/server dies
 */
server.on('error', killed);

/**
 * If and when the app dies
 */
process.once('exit', killed);
/**
 *  If and when the app dies
 */
process.once('disconnect', killed);

/// CERTIFICATES
// https://www.namecheap.com/support/knowledgebase/article.aspx/9705/33/installing-an-ssl-certificate-on-nodejs/

// https://javascript.plainenglish.io/generate-ssl-certificate-using-node-js-for-web-apps-73d452ad5898
