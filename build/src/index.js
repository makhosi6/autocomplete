"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./core/db/client");
const data_indexer_1 = require("./core/db/data-indexer");
const query_1 = require("./core/db/query");
const express = require('express');
const expressWss = require('express-ws');
const http = require('http'); // change to https
// Our port
const port = 3001;
/// set DB client
(0, client_1.client)().then(c => (global.client = c));
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
app.get('/', (req, res) => {
    res.send('Welcome to our app');
});
// Get the route /
app.get('/boot', async (req, res) => {
    /// boot the application
    await (0, data_indexer_1.preBoot)();
    // response
    res.status(200).send('Done');
});
// Get the route /
app.get('/feed-data/:category', async (req, res) => {
    ///categoty
    const category = req.params.category;
    await (0, data_indexer_1.feedValues)(decodeURIComponent(category));
    res.status(200).send('Done');
});
// http search
app.get('/search/autocomplete/:key', async (req, res) => {
    try {
        //query value
        const query = req.params.key;
        console.log({ query });
        //decode url and use iit to query DB
        const data = await (0, query_1.search)(decodeURIComponent(query));
        res.send(data);
    }
    catch (error) {
        console.log(error);
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
// TO_DO
// fix structure
// env
// search , sort and filter
//# sourceMappingURL=index.js.map