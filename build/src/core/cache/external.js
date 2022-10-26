"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_config_1 = require("../utils/node.config");
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: node_config_1.TTL, checkperiod: 120 });
cache.on('flush_stats', () => {
    console.log('\x1b[36m%s\x1b[0m', 'Cache Stats flushed');
});
cache.on('flush', () => {
    console.log('\x1b[35m%s\x1b[0m', 'Cache Data flushed');
});
cache.on('expired', (key, value) => {
    console.log('\x1b[34m%s\x1b[0m', 'Expired Cache item', {
        [key]: value,
    });
});
cache.on('set', (key, value) => {
    console.log('\x1b[33m%s\x1b[0m', 'CACHE: On set ' + key);
    console.log({ CACHE_STATS: cache.getStats() });
});
module.exports = cache;
