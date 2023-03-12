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
 * http search
 */
api.get('/api/v1/autocomplete/:key', (request: Request, response: Response) =>
  response.statusCode !== 429
    ? RedisHttpController.getAll(request, response)
    : response.status(response.statusCode).send({
        status: 429,
        message: 'Too Many Requests',
      })
);

/**
 * http search
 */
api.get('/api/v1/autocomplete', RedisHttpController.getAll);

export default api;
