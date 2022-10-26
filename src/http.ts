import {Application, request, Request, response, Response} from 'express';
import {WebSocket} from 'ws';
import {RedisHttpController} from './core/controllers/http';
import {client} from './core/db/client';
import {ADMIN_KEY, TTL, PORT} from './core/utils/node.config';
import {analytics, userIP, getWhiteList, isAuth} from './core/utils/helpers';
import {rateLimitArgs} from './core/utils/harmony.config';
const {rateLimitRedis} = require('@jwerre/rate-limit-redis');
const express = require('express');
const cors = require('cors');
const queue = require('./core/queue/index');
const cache = require('./core/cache/external');
const internal_cache = require('./core/cache/internal');
const compression = require('compression');

/// set DB client
client().then(c => ((global as any).client = c));

/// get whitelist
// to store locally
getWhiteList().then(users =>
  users.map(u =>
    internal_cache.set(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      u.key,
      u
    )
  )
);

// begin processing, get notified on end / failure
queue.start((err: any) => {
  if (err) throw err;
  console.log('\x1b[36m%s\x1b[0m', 'All done:', queue.results);
});

// App and server
const app: Application = express();

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
rateLimitRedis(rateLimitArgs);

/**
 * analytics
 *
 */
app.use((request: Request, response: Response, next: any) => {
  queue.push(() => analytics(request));
  next();
});

/**
 * middleware for all api routes
 * - authorization
 */
app.all(
  '/api/*',
  async (request: Request, response: Response, next: any): Promise<any> => {
    const bearerHeader = request.headers.authorization;

    /**
     * ddn't provide a key/token
     */
    if (!bearerHeader) {
      return response.sendStatus(400);
    } else {
      const bearerToken = bearerHeader.split(' ')[1];
      console.log({bearerToken});
      /// passed an empty token
      if (!bearerToken) return response.sendStatus(400);

      /**
       * If the token is valid
       */
      if (await isAuth(bearerToken)) next();
      /**
       * else go through
       */ else response.sendStatus(401);
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
          console.log({result});

          cache.set(result.ip, result, result.retry || TTL);
        })
        .catch(console.log);
    });

    console.log((global as any).rateLimitRedis);

    /// use cache to get user's usage data, and throttle the user if needed
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
    /**
     * flag if the ip address is not consistent
     */
    if (usageData?.ip !== userIP(request) && usageData.ip)
      console.log('\x1b[43m%s\x1b[0m', `${usageData.ip} VS ${userIP(request)}`);

    /**
     * user has exceeded the usage limit
     */
    if (usageData?.status === 429) {
      response.send(usageData.status);
    } else {
      /// else go through
      next();
    }
  }
);
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
app.all('/secret/*', (request: Request, response: Response, next: any) => {
  const bearerHeader = request.headers.authorization;

  /**
   * Flag usage of all admin routes
   */
  console.log(
    '\x1b[41m%s\x1b[0m',
    'All Admin routes ...',
    'USED TOKEN IS' + bearerHeader
  );
  /**
   * if the token is not included
   */
  if (!bearerHeader) {
    response.sendStatus(403);
  } else {
    const bearerToken = bearerHeader.split(' ')[1];
    console.log({bearerToken});
    if (bearerToken !== ADMIN_KEY) {
      /**
       *  if the token is not valid
       */
      response.sendStatus(403);
    } else {
      // if the token is valid
      next();
    }
  }
});

app.get('/', (req: Request, res: Response) => {
  res.redirect('/docs/get-started');
});
///
app.get('/home', (req: Request, res: Response) => {
  res.redirect('/docs/get-started');
});
// boot/create a Redis index
app.get('/secret/boot', RedisHttpController.createAnIndex);

// Update the authrized token/key list
app.post('/secret/whitelist', (request: Request, response: Response) => {
  try {
    console.log('Whitelist Updated');
    /// user auth infor
    const body = request.body;
    /// update internal white list store
    internal_cache.set(body.key, body);

    response.send(201);
  } catch (error) {
    response.send(500);
  }
});

// // Update the authrized token/key list
// app.post('/secret/whitelist', (request: Request, response: Response) => {
//   response.send('Whitelist Updated');
// });

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
  (global as any).rateLimitRedis.disconnect();
});
/// If and when the app dies
process.once('disconnect', async () => {
  console.log('\x1b[31m%s\x1b[0m', 'PROCESS DISCONNECTED...');

  /// the server and the client close the connection
  (global as any).client.quit();
  (global as any).rateLimitRedis.disconnect();
});

const server = app.listen(PORT, () =>
  console.log('\x1b[46m%s\x1b[0m', 'Running on port 3001')
);

console.log({
  maxConnections: server.maxConnections,
  getMaxListeners: server.getMaxListeners(),
  address: server.address(),
});

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

server.on('error', () => {
  (global as any).client.quit();
  (global as any).rateLimitRedis.disconnect();
});

/**

curl --location --request GET 'http://192.168.0.135:3001/api/v1/autocomplete/ye?limit=10&sort=DESC' \
  --header 'Authorization: Bearer THE_ONE'

 *
 */
