import {Application, Request, Response} from 'express';
// import {WebSocket} from 'ws';
import {client} from './core/db/client';
import {PORT} from './core/utils/node.config';
import {getWhiteList, killed} from './core/utils/helpers';
import {rateLimitArgs} from './core/utils/harmony.config';
import {analyticsHandler} from './middleware/analytics';
import secret from './routes/secret';
import api from './routes/api';
const {rateLimitRedis} = require('@jwerre/rate-limit-redis');
const express = require('express');
const cors = require('cors');
const queue = require('./core/queue/index');
const internal_cache = require('./core/cache/internal');
const compression = require('compression');
const logger = require('morgan');

/**
 * set DB client
 *
 */
client().then(c => ((global as any).client = c));

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
app.use(logger('common'));
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
app.use(express.static(__dirname + '/static'));
/**
 * Register routes
 */
app.use(secret);
app.use(api);
/**
 * Home routes
 */
app.get('/', (req: Request, res: Response) => {
  res.redirect('/docs/get-started');
});
app.get('/home', (req: Request, res: Response) => {
  res.redirect('/docs/get-started');
});
/**
 *  App and server
 */
const server = app.listen(PORT, () =>
  console.log('\x1b[46m%s\x1b[0m', 'Running on port 3001')
);

server.on('connection', s => {
  console.log(
    'Connections  => ',
    server.connections,
    ' ',
    s.remoteAddress,
    '',
    s.localAddress
  );
});
/**
 * If the app/server dies, just close the DB connection
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
