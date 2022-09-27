import {Request, Response} from 'express';
import {WebSocket} from 'ws';
import {client} from './core/db/client';
import {feedValues, preBoot} from './core/db/data-indexer';
import {search} from './core/db/query';
const express = require('express');
const expressWss = require('express-ws');
const http = require('http'); // change to https
client()
  .then(async (redis: any) => {
    // Our port
    const port = 3001;

    // App and server
    const app = express();
    const server = http
      .createServer(app)
      .listen(port, () => console.log('Running on port 3001'));

    // Apply expressWs
    expressWss(app, server);

    // app.use(express.static(__dirname + '/static'));

    //
    // await preBoot(redis);

    // await feedValues(redis);

    // auth middleware => https://www.linode.com/docs/guides/authenticating-over-websockets-with-jwt/
    // more https://github.dev/glynnbird/simple-autocomplete-service/blob/a922a4b773706192c996ba8486727572236ffa3e/app.js#L10
    // app.use();

    // Get the route /
    app.get('/', (req: Request, res: Response) => {
      res.send('Welcome to our app');
    });
    // http search
    app.get(
      '/search/autocomplete/:key',
      async (req: Request, res: Response): Promise<any> => {
        try {
          ///query
          const query: string = req.params.key;
          console.log({query});

          const data = await search(redis, query);

          res.send(data);
        } catch (error) {
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
  })
  .catch(console.error);
