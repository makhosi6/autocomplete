import {authorization} from './../middleware/authorization';
import {throttle} from './../middleware/throttle';
import {Request, Response, Router} from 'express';
import {RedisHttpController} from '../core/controllers/http';
import {rateLimitArgs} from '../core/utils/harmony.config';
import {userIP} from '../core/utils/helpers';
import {TTL} from '../core/utils/node.config';
const cache = require('../core/cache/external');
const express = require('express');

// router
const api: Router = express.Router();
/**
 * Rate limiting
 *
 */
api.use(throttle);

/**
 * auth
 */
api.use(authorization);
/**
 * Autocomplete API - path param: /api/v1/autocomplete/{query}
 * Fetches words that closely match the query, sorted by relevance
 */
api.get('/api/v1/autocomplete/search/:query', (request: Request, response: Response) =>
  response.statusCode !== 429
    ? RedisHttpController.search(request, response)
    : response.status(response.statusCode).send({
        status: 429,
        message: 'Too Many Requests',
      })
);

/**
 * Autocomplete API - query param: /api/v1/autocomplete/search?q={query}
 * (kept under the autocomplete namespace to avoid clashing with other
 * generic /search endpoints in the application)
 */
api.get('/api/v1/autocomplete/search', RedisHttpController.search);

/**
 * Autocomplete API - query param: /api/v1/autocomplete?q={query}
 */
api.get('/api/v1/autocomplete/suggest/:query', (request: Request, response: Response) =>
  response.statusCode !== 429
    ? RedisHttpController.suggest(request, response)
    : response.status(response.statusCode).send({
        status: 429,
        message: 'Too Many Requests',
      })
);

/** 
 * Autocomplete API - query param: /api/v1/autocomplete/suggest?q={query}
 */
api.get('/api/v1/autocomplete/suggest', RedisHttpController.suggest);

/**
 * Autocomplete API - path param: /api/v1/autocomplete/aggregate/{query}
 */
api.get('/api/v1/autocomplete/aggregate', RedisHttpController.aggregate);

/**
 * Autocomplete API - path param: /api/v1/autocomplete/aggregate/{query}
 */
api.get('/api/v1/autocomplete/aggregate/:query', (request: Request, response: Response) =>
  response.statusCode !== 429
    ? RedisHttpController.aggregate(request, response)
    : response.status(response.statusCode).send({
        status: 429,
        message: 'Too Many Requests',
      })
);

export default api;
