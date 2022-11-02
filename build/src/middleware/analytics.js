"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsHandler = void 0;
const helpers_1 = require("../core/utils/helpers");
const queue = require('../core/queue/index');
/**
 * Universal analytics middleware
 * @param request
 * @param response
 * @param next
 */
const analyticsHandler = (request, response, next) => {
    queue.push(() => (0, helpers_1.analytics)(request));
    next();
};
exports.analyticsHandler = analyticsHandler;
