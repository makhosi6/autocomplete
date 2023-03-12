import {Request, Response} from 'express';
import {userIP} from '../core/utils/helpers';

// Auth maintenance token && Lock to certain IP addr
export const filterLocalIPs = (
  request: Request,
  response: Response,
  next: Function
) => {
  /**
   * used Bearer token
   */
  const token = request.headers.authorization
    ? request.headers.authorization.split(' ')[1]
    : '';
  if (token !== 'TOKEN_TWO') {
    next();

    return;
  }
  /**
   * used ip addr
   */
  const ip = userIP(request) || request.ip;

  /**
   * whitelist
   */
  const whiteList = [
    '::1',
    '127.0.0.1',
    'MY-IP',
    '178.79.184.57',
    '192.168.0.134',
    '192.168.0.135',
  ];

  if (whiteList.includes(ip)) {
    next();
    return;
  } else {
    return response.status(401).send({
      status: 401,
      message: 'Unauthorized',
    });
  }
  /**
   *  if the token or IP addr is not valid
   */
};
