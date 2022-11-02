"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authorization_1 = require("./../middleware/authorization");
const throttle_1 = require("./../middleware/throttle");
const http_1 = require("../core/controllers/http");
const cache = require('../core/cache/external');
const express = require('express');
// router
const api = express.Router();
/**
 * Rate limiting
 *
 */
api.use(throttle_1.throttle);
/**
 * auth
 */
api.use(authorization_1.authorization);
/**
 * http search
 */
api.get('/api/v1/autocomplete/:key', (request, response) => response.statusCode !== 429
    ? http_1.RedisHttpController.getAll(request, response)
    : response.sendStatus(response.statusCode));
/**
 * http search
 */
api.get('/api/v1/autocomplete', http_1.RedisHttpController.getAll);
exports.default = api;
