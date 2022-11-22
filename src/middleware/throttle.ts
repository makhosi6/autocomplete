import {Request, Response} from 'express';
import {rateLimitArgs} from '../core/utils/harmony.config';
import {userIP} from '../core/utils/helpers';
import {TTL} from '../core/utils/node.config';
const cache = require('../core/cache/external');
const queue = require('../core/queue/index');

/**
 * Rate limiter for API routes
 * @param request
 * @param response
 * @param next
 * @returns
 */
export const throttle = async (
  request: Request,
  response: Response,
  next: any
): Promise<any> => {
  /**
   * push task to the queue: lookup usage on Redis and update the Cache
   */

  queue.push(() => {
    (global as any).rateLimitRedis
      .process(request)
      .then((result: any = {}) => {
        console.log({result});

        cache.set(userIP(request), result, result.retry || TTL);
      })
      .catch(console.log);
  });

  // console.log((global as any).rateLimitRedis);

  /// use cache to get user's usage data, and throttle the user if needed
  const usageData = {
    ...{
      ttl: (
        (cache.getTtl(userIP(request)) - new Date().getTime()) /
        1000
      ).toFixed(),
    },
    ...cache.get(userIP(request)),
  };
  /**
   * Set headers
   */
  response.set('x-ratelimit-limit', usageData.limit || rateLimitArgs.limit);
  response.set(
    'x-ratelimit-remaining',
    // eslint-disable-next-line eqeqeq
    usageData.remaining == 0
      ? usageData.remaining
      : String(usageData.remaining - 1 || rateLimitArgs.limit - 1)
  );
  response.set('retry-after', usageData.retry ? usageData.ttl : 0);

  console.log({usageData});
  /**
   * flag if the ip address is not consistent
   */
  if (usageData?.ip !== userIP(request) && usageData.ip)
    console.log('\x1b[43m%s\x1b[0m', `${usageData.ip} VS ${userIP(request)}`);

  /**
   * user has exceeded the usage limit
   */
  if (usageData?.status === 429) {
    response.sendStatus(usageData.status);
  } else {
    /// else go through
    next();
  }
};
