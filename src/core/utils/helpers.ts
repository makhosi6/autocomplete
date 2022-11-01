import {SERVICE_TWO, ADMIN_KEY} from './node.config';
import {Request} from 'express';
import {kill} from 'process';
const {Headers} = require('node-fetch');
// import {Headers} from 'node-fetch';

const internal_cache = require('../cache/internal');

export function uniqueId(key: string) {
  //reverse the key
  const salt = [...key].reverse().join('');

  //hash the key
  const hash = Buffer.from(`${salt + key}`).toString('base64');

  ///exclude special chars
  return hash.replace(/[^a-zA-Z0-9 ]/g, '');
}
/**
 * Check if a string has special characters
 */
export function hasSymbol(str: string) {
  // eslint-disable-next-line no-useless-escape
  const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  return specialChars.test(str);
}
/**
 * @summary utility function to escape special characters on Redis queries
 * @param {string} value
 * @return {string}
 */
export function escapeSymbol(value: string) {
  value = value.replace(':', '\\:');
  value = value.replace('_', '\\_');
  value = value.replace('-', '\\-');
  value = value.replace('@', '\\@');
  return value;
}

/**
 * @description program will sleep for x milliseconds
 * @param {number} ms
 * @returns Promise<void>
 */
export function waitFor(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * @description Get incoming requests and send analytics to the server \n
 * @sumamary **Data recorded**
 *  - hostname
 *  - query
 *  - pathname
 *  -  path
 *  - query data
 *  - ip
 *  - token
 *  - time
 *  - useragent
 *  - body
 * - rawHeaders as Array
 * -
 *
 * @param {Request} request
 *
 */
export async function analytics(request: Request) {
  try {
    // console.log(request);
    console.log(userIP(request));

    //auth headers
    const myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer ' + ADMIN_KEY);

    const res = await fetch(SERVICE_TWO + '/analytics', {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        token: request.headers.authorization.split(' ')[1] || '',
        x_ip: userIP(request),
        x_query: request.params.key,
        x_hostname: request.hostname || '',
        timestamp: new Date().getTime(),
        x_params: JSON.stringify(request.query),
        x_rawHeaders: request.rawHeaders.toString(),
        x_body: request.body ? JSON.stringify(request.body) : '',
      }),
    });
    console.log(
      JSON.stringify({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        token: request.headers.authorization.split(' ')[1] || '',
        x_ip: userIP(request),
        x_query: request.params.key,
        x_hostname: request.hostname || '',
        timestamp: new Date().getTime(),
        x_params: JSON.stringify(request.query),
        x_rawHeaders: request.rawHeaders.toString(),
        x_body: request.body ? JSON.stringify(request.body) : '',
      })
    );

    console.log('\x1b[43m%s\x1b[0m', `Analytics sent! status ${res.status}`);

    console.log('Analytics');
  } catch (error) {
    console.log(error);
  }
}

export function userIP(req: Request) {
  return (
    req.headers['X-Client-IP'] ||
    req.headers['X-Forwarded-For'] || // X-Forwarded-For (Header may return multiple IP addresses in the format: "client IP, proxy 1 IP, proxy 2 IP", so we take the the first one.)
    req.headers['CF-Connecting-IP'] || //( (Cloudflare)
    req.headers['Fastly-Client-Ip'] || //( (Fastly CDN and Firebase hosting header when forwared to a cloud function)
    req.headers['True-Client-Ip'] || //( (Akamai and Cloudflare)
    req.headers['X-Real-IP'] || //( (Nginx proxy/FastCGI)
    req.headers['X-Cluster-Client-IP'] || //( (Rackspace LB, Riverbed Stingray)
    req.headers['X-Forwarded'] ||
    req.headers['Forwarded-For'] ||
    req.headers['Forwarded'] ||
    req.headers['Variations'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    req.connection?.socket?.remoteAddress ||
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    req?.info?.remoteAddress
  );
}
/**
 * Get a list of registered/authenticated users from the database
 * @returns Promise<Array<object>>
 *
 */
export const getWhiteList = async function (): Promise<Array<object>> {
  try {
    const myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer ' + ADMIN_KEY);

    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    };

    const response = await fetch(SERVICE_TWO + '/tokens', requestOptions);

    // console.log('TOKENS RESPONSE', await response.text());

    const data = await response.json();
    console.log({data});
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore

    return data;
  } catch (error) {
    console.log(error);

    return [];
  }
};
/**
 * Validate the user auth token against the stored collection of tokens
 * @param token user auth token
 * @returns {boolean}
 */
export const isAuth = async (token: string): Promise<boolean> => {
  console.log('\x1b[43m%s\x1b[0m', '🚧🚧🚧🚧 ', token);
  const user = internal_cache.get(token);

  console.log({foundUser: user});

  /// if user is not on the whitelist
  if (user === undefined || user === null) return false;
  else if (user instanceof Object) return true;
  console.log('\x1b[43m%s\x1b[0m', '🚧🚧🚧🚧 USER IS UNDEFINED');
  return false;
};
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const fetch = (...args) =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  import('node-fetch').then(({default: fetch}) => fetch(...args));
/**
 * If and when the app dies or it's stopped
 */
export const killed = async () => {
  console.log('\x1b[31m%s\x1b[0m', 'PROCESS STOPPED...');

  /**
   * close  the server and the client DB  connection
   */
  (global as any).client.quit();
  (global as any).rateLimitRedis.disconnect();
};
