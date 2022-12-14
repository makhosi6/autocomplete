const NodeCache = require('node-cache');
const internal_cache = new NodeCache({checkperiod: 120});

internal_cache.on('flush_stats', () => {
  console.log('\x1b[36m%s\x1b[0m', 'Internal Cache: Cache Stats flushed');
});

internal_cache.on('flush', () => {
  console.log('\x1b[35m%s\x1b[0m', 'Internal Cache: Cache Data flushed');
});

internal_cache.on('expired', (key: any, value: any) => {
  console.log('\x1b[34m%s\x1b[0m', 'Internal Cache: Expired Cache item', {
    [key]: value,
  });
});

internal_cache.on('set', (key: any, value: any) => {
  console.log('\x1b[33m%s\x1b[0m', 'Internal Cache: CACHE: On set ' + key);
  console.log({CACHE_STATS: internal_cache.getStats()});
  console.log({cacheLength: internal_cache.keys().length});
});
internal_cache.on('del', (key: any, value: any) => {
  console.log('\x1b[33m%s\x1b[0m', 'Internal Cache: CACHE: On Delete ' + key);
  console.log({CACHE_STATS: internal_cache.getStats()});
});

module.exports = internal_cache;
