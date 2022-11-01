import {adminHandler} from './../middleware/admin';
import {Request, Response} from 'express';
import {RedisHttpController} from '../core/controllers/http';

const express = require('express');

// router
const secret = express.Router();

/**
 * Add a key/token to cache
 * @param request
 * @param response
 */
const updateWhitelist = (request: Request, response: Response) => {
  try {
    console.log('Whitelist Updated');
    /// user auth infor
    const body = request.body;
    /// update internal white list store
    internal_cache.set(body.token, body);

    console.log(internal_cache.getStats());

    response.send(201);
  } catch (error) {
    response.send(500);
  }
};
/**
 *  remove a key/token from cache
 * @param request
 * @param response
 */
const removeFrmWhitelist = (request: Request, response: Response) => {
  try {
    console.log('Whitelist Updated');
    /// user auth infor
    const body = request.body;
    /// update internal white list store
    internal_cache.take(body.token);

    console.log(internal_cache.getStats());
    response.send(201);
  } catch (error) {
    response.send(500);
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
