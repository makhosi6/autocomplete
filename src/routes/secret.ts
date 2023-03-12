import {adminHandler} from './../middleware/admin';
import {Request, Response, Router} from 'express';
import {RedisHttpController} from '../core/controllers/http';
const internal_cache = require('../core/cache/internal');

const express = require('express');

// router
const secret: Router = express.Router();

/**
 * Add a key/token to cache
 * @param request
 * @param response
 */
const updateWhitelist = (request: Request, response: Response) => {
  try {
    console.log('Whitelist Updated ', request.method);
    /// user auth infor
    const body = request.body[0];

    console.log({body});

    /// update internal white list store
    internal_cache.set(body.token, body);

    console.log(
      '\x1b[36m%s\x1b[0m',
      'ADD NEW TOKEN',
      internal_cache.getStats()
    );

    response.status(201).send({
      status: 200,
      message: 'OK',
    });
  } catch (error) {
    console.log(error);
    response.status(500).send({
      status: 500,
      message: 'Internal server error',
    });
  }
};
/**
 *  remove a key/token from cache
 * @param request
 * @param response
 */
const removeFrmWhitelist = (request: Request, response: Response) => {
  try {
    console.log('Whitelist Updated ', request.method);
    /// user auth infor
    const body = request.body[0];

    console.log({body});
    /// update internal white list store
    internal_cache.take(body.token);

    console.log(
      '\x1b[32m%s\x1b[0m',
      'REMOVE ONE TOKEN',
      internal_cache.getStats()
    );
    response.status(201).send({
      status: 201,
      message: 'OK',
    });
  } catch (error) {
    console.log(error);

    response.status(500).send({
      status: 500,
      message: 'Internal server error',
    });
  }
};

/**
 *  admin and maintenance routes, All hide behind a the ADMIN_KEY
 *
 */
secret.use(adminHandler);

/**
 * boot/create a Redis index
 */
secret.get('/secret/boot', RedisHttpController.createAnIndex);

/**
 * Update the authorized token/key list
 */
secret.post('/secret/whitelist', updateWhitelist);
/**
 *  Update the authorized token/key list
 */
secret.delete('/secret/whitelist/', removeFrmWhitelist);

/**
 * Feed data to Redis
 */
secret.get('/secret/feed-data/:category', RedisHttpController.feedData);

export default secret;
