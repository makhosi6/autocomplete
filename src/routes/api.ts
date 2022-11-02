import {authorization} from './../middleware/authorization';
import {throttle} from './../middleware/throttle';
import {Request, Response} from 'express';
import {RedisHttpController} from '../core/controllers/http';
import {rateLimitArgs} from '../core/utils/harmony.config';
import {userIP} from '../core/utils/helpers';
import {TTL} from '../core/utils/node.config';
const cache = require('../core/cache/external');
const express = require('express');

// router
const api = express.Router();
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
    : response.sendStatus(response.statusCode)
);

/**
 * http search
 */
api.get('/api/v1/autocomplete', RedisHttpController.getAll);

export default api;
