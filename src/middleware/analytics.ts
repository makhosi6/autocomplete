import {Request, Response} from 'express';
import {analytics} from '../core/utils/helpers';

/**
 * Universal analytics middleware
 * @param request
 * @param response
 * @param next
 */
export const analyticsHandler = (
  request: Request,
  response: Response,
  next: any
) => {
  queue.push(() => analytics(request));
  next();
};
