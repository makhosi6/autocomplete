"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin_1 = require("./../middleware/admin");
const http_1 = require("../core/controllers/http");
const internal_cache = require('../core/cache/internal');
const express = require('express');
// router
const secret = express.Router();
/**
 * Add a key/token to cache
 * @param request
 * @param response
 */
const updateWhitelist = (request, response) => {
    try {
        console.log('Whitelist Updated ', request.method);
        /// user auth infor
        const body = request.body[0];
        console.log({ body });
        /// update internal white list store
        internal_cache.set(body.token, body);
        console.log('\x1b[36m%s\x1b[0m', 'ADD NEW TOKEN', internal_cache.getStats());
        response.status(201).send({
            status: 200,
            message: 'OK',
        });
    }
    catch (error) {
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
const removeFrmWhitelist = (request, response) => {
    try {
        console.log('Whitelist Updated ', request.method);
        /// user auth infor
        const body = request.body[0];
        console.log({ body });
        /// update internal white list store
        internal_cache.take(body.token);
        console.log('\x1b[32m%s\x1b[0m', 'REMOVE ONE TOKEN', internal_cache.getStats());
        response.status(201).send({
            status: 201,
            message: 'OK',
        });
    }
    catch (error) {
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
secret.use(admin_1.adminHandler);
/**
 * boot/create a Redis index
 */
secret.get('/secret/boot/:category', http_1.RedisHttpController.createAnIndex);
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
secret.get('/secret/feed-data/:category', http_1.RedisHttpController.feedData);
exports.default = secret;
