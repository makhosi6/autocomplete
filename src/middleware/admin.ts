import {Request, Response} from 'express';
import {ADMIN_KEY} from '../core/utils/node.config';

/**
 * Authorize and Authenticate admin and maintainer routes
 * @param request
 * @param response
 * @param next
 */
export const adminHandler = (
  request: Request,
  response: Response,
  next: any
) => {
  const bearerHeader = request.headers.authorization;

  /**
   * Flag usage of all admin routes
   */
  console.log(
    '\x1b[41m%s\x1b[0m',
    'All Admin routes ...',
    'USED TOKEN IS' + bearerHeader
  );
  /**
   * if the token is not included
   */
  if (!bearerHeader) {
    response.status(403).send({
      status: 403,
      message: 'Forbidden',
    });
  } else {
    const bearerToken = bearerHeader.split(' ')[1];
    console.log({bearerToken});
    if (bearerToken !== ADMIN_KEY) {
      /**
       *  if the token is not valid
       */
      response.status(403).send({
        status: 403,
        message: 'Forbidden',
      });
    } else {
      // if the token is valid
      next();
    }
  }
};
