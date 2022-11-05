const RateLimitRedis = require('./rate_limit_redis');

const rateLimitRedis = async function (options) {
  const {headers = true} = options;

	global.rateLimitRedis = new RateLimitRedis(options);

	return function middleware(req, res, next) {
    global.rateLimitRedis
      .process(req)
			.then((result = {}) => {
				if (headers) {
					res.set('x-ratelimit-limit', result.limit);
					res.set('x-ratelimit-remaining', result.remaining);
					res.set('retry-after', result.retry);
				}

				res.status(result.status);
				next();
			})
			.catch(next);
	};
};

module.exports = {RateLimitRedis, rateLimitRedis};
