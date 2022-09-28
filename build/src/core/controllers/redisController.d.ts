import { Request, Response } from 'express';
export declare class RedisController {
    constructor();
    /**
     * index - get one
     */
    static index(): Promise<void>;
    /**
     * index - get all with limit
     * - defualt is 5
     * - maximum is 10
     * - minimum is 1
     */
    static getAll(request: Request, response: Response): Promise<any>;
    /**
     * feed data into Redis from a file
     */
    static feedData(request: Request, response: Response): Promise<void>;
    /**
     * create a Redis data index
     */
    static createAnIndex(): Promise<void>;
}
