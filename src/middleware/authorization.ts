import {Request, Response} from 'express';
import {isAuth} from '../core/utils/helpers';

/**
 * auth middleware for all api routes
 * - authorization
 * - authentication
 * @param request
 * @param response
 * @param next
 * @returns
 */

export const authorization = async (
  request: Request,
  response: Response,
  next: any
): Promise<any> => {
  const bearerHeader = request.headers.authorization;

  /**
   * ddn't provide a key/token
   */
  if (!bearerHeader) {
    return response.sendStatus(400);
  } else {
    const bearerToken = bearerHeader.split(' ')[1];
    console.log({bearerToken});
    /// passed an empty token
    if (!bearerToken) return response.sendStatus(400);

    /**
     * If the token is valid
     */
    if (await isAuth(bearerToken)) next();
    /**
     * else go through
     */ else response.sendStatus(401);
  }
};
