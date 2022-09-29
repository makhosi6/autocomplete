import {request, Request, Response} from 'express';
import {WebSocket} from 'ws';
import {RedisHttpController} from './core/controllers/http';
import {client} from './core/db/client';
import {ADMIN_KEY} from './core/utils/app.config';
import {rateLimitArgs} from './core/utils/rate-limiting.config';
const rr = require('@jwerre/rate-limit-redis');
const express = require('express');
const cors = require('cors');
const compression = require('compression');
// Our port
const port = 3001;

/// set DB client
client().then(c => ((global as any).client = c));

console.log({
  rr,
});

// App and server
const app = express();

/*******************
 *  MIDDLEWARES
 *
 *****************/
app.use(cors());
app.use(express.json());
// use trust proxy if behind load balancer
app.enable('trust proxy');

let fn: Function(request: Request, response: Response, next: any) =  rr.rateLimitRedis(rateLimitArgs);
app.use(fn);
// compress all requests
app.use(compression());
// app.use(express.static(__dirname + '/src/static'));

/// middleware for all api routes
app.all(
  '/api/*',
  async (request: Request, response: Response, next: any): Promise<any> => {
    console.log('All API routes ...');
    const bearerHeader = request.headers.authorization;
    if (!bearerHeader) {
      return response.sendStatus(401);
    } else {
      const bearerToken = bearerHeader.split(' ')[1];
      console.log({bearerToken});
      if (bearerToken !== 'THE_ONE') response.sendStatus(401);

      next();
    }
  }
);

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
  res.redirect('/docs/get-started');
});
// boot/create a Redis index
app.get('/secret/boot', RedisHttpController.createAnIndex);

// Get the route /
app.get('/secret/feed-data/:category', RedisHttpController.feedData);
// http search
app.get('/api/v1/autocomplete/:key', RedisHttpController.getAll);

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

const server = app.listen(port);

server.on('error', () => {
  (global as any).rateLimitRedis.disconnect();
});
