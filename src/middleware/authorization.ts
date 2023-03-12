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
    return response.status(400).send({
      status: 400,
      message: 'Bad Request',
    });
  } else {
    const bearerToken = bearerHeader.split(' ')[1];
    console.log({bearerToken});
    /// passed an empty token
    if (!bearerToken)
      return response.status(400).send({
        status: 400,
        message: 'Bad Request',
      });

    /**
     * If the token is valid
     */
    if (await isAuth(bearerToken)) {
      next();
    } else {
      /**
       * else go through 401
       */
      response.status(401).send({
        status: 401,
        message: 'Unauthorized',
      });
    }
  }
};
