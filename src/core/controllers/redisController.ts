import {Request, Response} from 'express';
import {feedValues, preBoot} from '../db/data-indexer';
import {search} from '../db/query';

export class RedisController {
  constructor() {}

  /**
   * index - get one
   */
  static async index() {}
  /**
   * index - get all with limit
   * - defualt is 5
   * - maximum is 10
   * - minimum is 1
   */
  static async getAll(request: Request, response: Response): Promise<any> {
    try {
      //query value
      const query: string = request.params.key;

      /**
       * optional limit
       * - defualt is 5
       * - maximum is 10
       * - minimum is 1
       */
      const limit = request.query.limit
        ? /// if greater than 10 default to 5
          Number(request.query.limit) > 10
          ? 5
          : Number(request.query.limit)
        : undefined;

      /**
       * decode url and use it to query DB
       */
      const data = await search(decodeURIComponent(query), limit);

      ///
      response.send(data);
    } catch (error) {
      console.log(error);
      /// throw server error
      response.sendStatus(500);
    }
  }
  /**
   * feed data into Redis from a file
   */
  static async feedData(request: Request, response: Response) {
    try {
      /**
       * category
       */
      const category: string = request.params.category;

      //feed values to Redis
      await feedValues(decodeURIComponent(category));

      response.status(200).send('Done');
    } catch (error) {
      console.log(error);
      response.status(500).send('Done');
    }
  }
  /**
   * create a Redis data index
   */
  static async createAnIndex(_: any, response: Response): Promise<any> {
    try {
      await preBoot();

      response.status(200).send('Done');
    } catch (error) {
      response.sendStatus(500);
    }
  }
}
