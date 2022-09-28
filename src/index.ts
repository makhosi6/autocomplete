import {Request, Response} from 'express';
import {WebSocket} from 'ws';
import {client} from './core/db/client';
import {feedValues, preBoot} from './core/db/data-indexer';
import {search} from './core/db/query';
const express = require('express');
const expressWss = require('express-ws');
const http = require('http'); // change to https

// Our port
const port = 3001;

/// set DB client
client().then(c => ((global as any).client = c));

// App and server
const app = express();
const server = http
  .createServer(app)
  .listen(port, () => console.log('Running on port 3001'));

// Apply expressWs
expressWss(app, server);

// app.use(express.static(__dirname + '/static'));

// auth middleware => https://www.linode.com/docs/guides/authenticating-over-websockets-with-jwt/
// more https://github.dev/glynnbird/simple-autocomplete-service/blob/a922a4b773706192c996ba8486727572236ffa3e/app.js#L10
// app.use();

// Get the route /
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to our app');
});
// Get the route /
app.get('/boot', async (req: Request, res: Response) => {
  /// boot the application
  await preBoot();
  // response
  res.status(200).send('Done');
});

// Get the route /
app.get('/feed-data/:category', async (req: Request, res: Response) => {
  ///categoty
  const category: string = req.params.category;

  await feedValues(decodeURIComponent(category));

  res.status(200).send('Done');
});
// http search
app.get(
  '/search/autocomplete/:key',
  async (req: Request, res: Response): Promise<any> => {
    try {
      //query value
      const query: string = req.params.key;
      console.log({query});
      //decode url and use iit to query DB
      const data = await search(decodeURIComponent(query));

      res.send(data);
    } catch (error) {
      console.log(error);

      res.sendStatus(500);
    }
  }
);
/// websocket search
app.ws('/', (ws: WebSocket) => {
  ws.on('message', (msg: string) => {
    console.log({msg});
    ws.send(msg);
  });
});

/// bad request
app.get('*', (req: Request, res: Response) => {
  res.status(400);
});

// TO_DO
// fix structure
// env
// search , sort and filter
