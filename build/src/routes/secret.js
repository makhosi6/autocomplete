"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin_1 = require("./../middleware/admin");
const http_1 = require("../core/controllers/http");
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
        console.log('Whitelist Updated');
        /// user auth infor
        const body = request.body;
        /// update internal white list store
        internal_cache.set(body.token, body);
        console.log(internal_cache.getStats());
        response.sendStatus(201);
    }
    catch (error) {
        response.sendStatus(500);
    }
};
/**
 *  remove a key/token from cache
 * @param request
 * @param response
 */
const removeFrmWhitelist = (request, response) => {
    try {
        console.log('Whitelist Updated');
        /// user auth infor
        const body = request.body;
        /// update internal white list store
        internal_cache.take(body.token);
        console.log(internal_cache.getStats());
        response.sendStatus(201);
    }
    catch (error) {
        response.sendStatus(500);
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
secret.get('/secret/boot', http_1.RedisHttpController.createAnIndex);
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
