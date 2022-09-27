"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./core/db/client");
const query_1 = require("./core/db/query");
const express = require('express');
const expressWss = require('express-ws');
const http = require('http'); // change to https
(0, client_1.client)()
    .then(async (redis) => {
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
    app.get('/', (req, res) => {
        res.send('Welcome to our app');
    });
    // http search
    app.get('/search/autocomplete/:key', async (req, res) => {
        try {
            ///query
            const query = req.params.key;
            console.log({ query });
            const data = await (0, query_1.search)(redis, query);
            res.send(data);
        }
        catch (error) {
            res.sendStatus(500);
        }
    });
    /// websocket search
    app.ws('/', (ws) => {
        ws.on('message', (msg) => {
            console.log({ msg });
            ws.send(msg);
        });
    });
    /// bad request
    app.get('*', (req, res) => {
        res.status(400);
    });
})
    .catch(console.error);
//# sourceMappingURL=index.js.map