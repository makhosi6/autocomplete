import {Request, Response} from 'express';
import {WebSocket} from 'ws';
import {RedisController} from './core/controllers/redisController';
import {client} from './core/db/client';
const express = require('express');
const expressWs = require('express-ws');
const http = require('http'); // change to https
const timeout = require('connect-timeout');

// Our port
const port = 3001;

/// set DB client
client().then(c => ((global as any).client = c));

// App and server
const app = express();

///
const server = http
  .createServer(app)
  .listen(port, () => console.log('Running on port 3001'));

// Apply expressWss
expressWs(app, server);

/*******************
 *  MIDDLEWARES
 *
 *****************/
app.use(timeout(1500));
app.use(express.json());
app.use(express.static(__dirname + '/src/static'));

///
app.all('*', (request: Response, response: Response, next: any) => {
  console.log('All routes ...');
  /// set
  next();
});

// auth middleware => https://www.linode.com/docs/guides/authenticating-over-websockets-with-jwt/
// more https://github.dev/glynnbird/simple-autocomplete-service/blob/a922a4b773706192c996ba8486727572236ffa3e/app.js#L10
// app.use();

// go to docs
app.get('/', (req: Request, res: Response) => {
  res.redirect('/docs/get-started');
});
///
app.get('/home', (req: Request, res: Response) => {
  res.redirect('/docs/get-started');
});
// boot/create a Redis index
app.get('/boot', RedisController.createAnIndex);

// Get the route /
app.get('/feed-data/:category', RedisController.feedData);
// http search
app.get('/search/autocomplete/:key', RedisController.getAll);
/// websocket search
app.ws('/', (ws: WebSocket) => {
  ws.on('message', (msg: string) => {
    console.log({msg});
    ws.send(msg);
  });
});

/// bad request
// app.get('*', (req: Request, res: Response) => {
//   res.status(400);
// });

/// If and when the app dies
process.once('exit', async () => {
  console.log('\x1b[31m%s\x1b[0m', 'PROCESS STOPPED...');

  /// the server and the client  close the connection
  (global as any).client.quit();
});

// TO_DO
// fix structure
// env
// search , sort and filter
