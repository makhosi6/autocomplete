import {request, Request, response, Response} from 'express';
import {WebSocket} from 'ws';
import {RedisHttpController} from './core/controllers/http';
import {client} from './core/db/client';
import {ADMIN_KEY, TTL, PORT} from './core/utils/app.config';
import {rateLimitArgs} from './core/utils/rate-limiting.config';
const {rateLimitRedis} = require('@jwerre/rate-limit-redis');
const express = require('express');
const cors = require('cors');
const queue = require('./core/queue/index');
const cache = require('./core/cache/index');
const compression = require('compression');

/// set DB client
client().then(c => ((global as any).client = c));

// begin processing, get notified on end / failure
queue.start((err: any) => {
  // console.log('\x1b[36m%s\x1b[0m', 'START QUEUE!34');
  if (err) throw err;
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
rateLimitRedis(rateLimitArgs);

/**
 * middleware for all api routes
 * - authorization
 */
app.all(
  '/api/*',
  async (request: Request, response: Response, next: any): Promise<any> => {
    const bearerHeader = request.headers.authorization;
    if (!bearerHeader) {
      return response.sendStatus(401);
    } else {
      const bearerToken = bearerHeader.split(' ')[1];
      console.log({bearerToken});
      if (bearerToken !== 'THE_ONE') response.sendStatus(401);
      else next();
    }
  }
);
/**
 * Rating
 *
 */
app.all(
  '/api/*',
  async (request: Request, response: Response, next: any): Promise<any> => {
    /**
     * push task to the queue: lookup usage on Redis and update the Cache
     */

    queue.push(() => {
      (global as any).rateLimitRedis
        .process(request)
        .then((result: any = {}) => {
          cache.set(result.ip, result, result.retry || TTL);
        })
        .catch(console.log);
    });

    /// use cache to get user's usage data, and throttle the user if need
    const usageData = {
      ...{
        ttl: (
          (cache.getTtl(request.ip) - new Date().getTime()) /
          1000
        ).toFixed(),
      },
      ...cache.get(request.ip),
    };
    /**
     * Set headers
     */
    response.set('x-ratelimit-limit', usageData.limit || rateLimitArgs.limit);
    response.set(
      'x-ratelimit-remaining',
      // eslint-disable-next-line eqeqeq
      usageData.remaining == 0
        ? usageData.remaining
        : String(usageData.remaining - 1 || rateLimitArgs.limit - 1)
    );
    response.set('retry-after', usageData.retry ? usageData.ttl : 0);

    console.log({usageData});

    if (usageData?.status === 429) {
      response.send(usageData.status);
    } else {
      next();
    }
    ///
  }
);
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
app.all('/secret/*', (request: Request, response: Response, next: any) => {
  console.log('All Admin routes ...');
  const bearerHeader = request.headers.authorization;
  if (!bearerHeader) {
    response.sendStatus(403);
  } else {
    const bearerToken = bearerHeader.split(' ')[1];
    console.log({bearerToken});
    if (bearerToken !== ADMIN_KEY) response.sendStatus(403);
    next();
  }
});

// auth middleware => https://www.linode.com/docs/guides/authenticating-over-websockets-with-jwt/

// go to docs
app.get('/', (req: Request, res: Response) => {
  res.redirect('/docs/get-started');
});
///
app.get('/home', (req: Request, res: Response) => {
  // res.redirect('/docs/get-started');
  // console.log();
  if (res.statusCode !== 429)
    res.send({
      said: 'Haappiee',
    });
  else res.send(res.statusCode);
});
// boot/create a Redis index
app.get('/secret/boot', RedisHttpController.createAnIndex);

// Get the route /
app.get('/secret/feed-data/:category', RedisHttpController.feedData);
// http search
app.get('/api/v1/autocomplete/:key', (request: Request, response: Response) =>
  response.statusCode !== 429
    ? RedisHttpController.getAll(request, response)
    : response.send(response.statusCode)
);
app.get('/api/v2/search/autocomplete/:key', RedisHttpController.getAll);

/// If and when the app dies
process.once('exit', async () => {
  console.log('\x1b[31m%s\x1b[0m', 'PROCESS STOPPED...');

  /// the server and the client close the connection
  (global as any).client.quit();
});
/// If and when the app dies
process.once('disconnect', async () => {
  console.log('\x1b[31m%s\x1b[0m', 'PROCESS DISCONNECTED...');

  /// the server and the client close the connection
  (global as any).client.quit();
});

// app.listen(port, () => console.log('Running on port 3001'));

const server = app.listen(PORT, () =>
  console.log('\x1b[46m%s\x1b[0m', 'Running on port 3001')
);

server.on('error', () => {
  (global as any).rateLimitRedis.disconnect();
});

/**

curl --location --request GET 'http://192.168.0.135:3001/api/v1/autocomplete/ye?limit=10&sort=DESC' \
  --header 'Authorization: Bearer THE_ONE'

 *
 */
