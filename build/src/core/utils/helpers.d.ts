import { Request } from 'express';
export declare function uniqueId(key: string): string;
/**
 * Check if a string has special characters
 */
export declare function hasSymbol(str: string): boolean;
/**
 * @summary utility function to escape special characters on Redis queries
 * @param {string} value
 * @return {string}
 */
export declare function escapeSymbol(value: string): string;
/**
 * @description program will sleep for x milliseconds
 * @param {number} ms
 * @returns Promise<void>
 */
export declare function waitFor(ms: number): Promise<unknown>;
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
export declare function analytics(request: Request): void;
export declare function userIP(req: Request): any;
/**
 * Get a list of registered/authenticated users from the database
 * @returns Promise<Array<object>>
 *
 */
export declare const getWhiteList: () => Promise<Array<object>>;
/**
 * Validate the user auth token against the stored collection of tokens
 * @param token user auth token
 * @returns {boolean}
 */
export declare const isAuth: (token: string) => Promise<boolean>;
