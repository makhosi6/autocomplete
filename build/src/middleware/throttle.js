"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.throttle = void 0;
const harmony_config_1 = require("../core/utils/harmony.config");
const helpers_1 = require("../core/utils/helpers");
const node_config_1 = require("../core/utils/node.config");
const cache = require('../core/cache/external');
const queue = require('../core/queue/index');
/**
 * Rate limiter for API routes
 * @param request
 * @param response
 * @param next
 * @returns
 */
const throttle = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    /**
     * push task to the queue: lookup usage on Redis and update the Cache
     */
    queue.push(() => {
        global.rateLimitRedis
            .process(request)
            .then((result = {}) => {
            console.log({ result });
            cache.set(result.ip, result, result.retry || node_config_1.TTL);
        })
            .catch(console.log);
    });
    // console.log((global as any).rateLimitRedis);
    /// use cache to get user's usage data, and throttle the user if needed
    const usageData = Object.assign({
        ttl: ((cache.getTtl((0, helpers_1.userIP)(request)) - new Date().getTime()) /
            1000).toFixed(),
    }, cache.get((0, helpers_1.userIP)(request)));
    /**
     * Set headers
     */
    response.set('x-ratelimit-limit', usageData.limit || harmony_config_1.rateLimitArgs.limit);
    response.set('x-ratelimit-remaining', 
    // eslint-disable-next-line eqeqeq
    usageData.remaining == 0
        ? usageData.remaining
        : String(usageData.remaining - 1 || harmony_config_1.rateLimitArgs.limit - 1));
    response.set('retry-after', usageData.retry ? usageData.ttl : 0);
    console.log({ usageData });
    /**
     * flag if the ip address is not consistent
     */
    if ((usageData === null || usageData === void 0 ? void 0 : usageData.ip) !== (0, helpers_1.userIP)(request) && usageData.ip)
        console.log('\x1b[43m%s\x1b[0m', `${usageData.ip} VS ${(0, helpers_1.userIP)(request)}`);
    /**
     * user has exceeded the usage limit
     */
    if ((usageData === null || usageData === void 0 ? void 0 : usageData.status) === 429) {
        response.sendStatus(usageData.status);
    }
    else {
        /// else go through
        next();
    }
});
exports.throttle = throttle;
