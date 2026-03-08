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
 * Autocomplete API - path param: /api/v1/autocomplete/{query}
 * Fetches words that closely match the query, sorted by relevance
 */
api.get('/api/v1/autocomplete/search/:query', (request, response) => response.statusCode !== 429
    ? http_1.RedisHttpController.search(request, response)
    : response.status(response.statusCode).send({
        status: 429,
        message: 'Too Many Requests',
    }));
/**
 * Autocomplete API - query param: /api/v1/autocomplete/search?q={query}
 * (kept under the autocomplete namespace to avoid clashing with other
 * generic /search endpoints in the application)
 */
api.get('/api/v1/autocomplete/search', http_1.RedisHttpController.search);
/**
 * Autocomplete API - query param: /api/v1/autocomplete?q={query}
 */
api.get('/api/v1/autocomplete/suggest/:query', (request, response) => response.statusCode !== 429
    ? http_1.RedisHttpController.suggest(request, response)
    : response.status(response.statusCode).send({
        status: 429,
        message: 'Too Many Requests',
    }));
/**
 * Autocomplete API - query param: /api/v1/autocomplete/suggest?q={query}
 */
api.get('/api/v1/autocomplete/suggest', http_1.RedisHttpController.suggest);
/**
 * Autocomplete API - path param: /api/v1/autocomplete/aggregate/{query}
 */
api.get('/api/v1/autocomplete/aggregate', http_1.RedisHttpController.aggregate);
/**
 * Autocomplete API - path param: /api/v1/autocomplete/aggregate/{query}
 */
api.get('/api/v1/autocomplete/aggregate/:query', (request, response) => response.statusCode !== 429
    ? http_1.RedisHttpController.aggregate(request, response)
    : response.status(response.statusCode).send({
        status: 429,
        message: 'Too Many Requests',
    }));
exports.default = api;
//# sourceMappingURL=api.js.map