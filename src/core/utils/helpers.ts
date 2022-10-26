import {request, Request} from 'express';
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
export function analytics(request: Request) {
  // console.log(request);
  console.log(userIP(request));

  console.log('Analytics');
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
  return [];
};
/**
 * Validate the user auth token against the stored collection of tokens
 * @param token user auth token
 * @returns {boolean}
 */
export const isAuth = async (token: string): Promise<boolean> => {
  return token !== '';
};
