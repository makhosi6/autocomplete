import {Request, Response} from 'express';
import {feedValues, preBoot} from '../db/data-indexer';
import {search} from '../db/query';

export class RedisHttpController {
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
      const query: string =
        request.params.key || request.query.q?.toString() || '';

      /**
       * bad request guard
       */

      if (!query) {
        response.send({
          status: 400,
          message: 'Bad Request',
        });

        return;
      }
      /**
       * optional sort ['DESC' | 'ASC' ]
       *
       */
      const sort = request.query.sort ? request.query.sort : 'ASC';
      /**
       * verbose
       */
      const isVerbose = Boolean(request.query.verbose);
      /**
       * optional limit
       * - defualt is 5
       * - maximum is 10
       * - minimum is 1
       */
      const limit = request.query.limit
        ? Number(request.query.limit) === 0
          ? 5
          : /// if greater than 10 default to 10

          Number(request.query.limit) > 10
          ? 10
          : Number(request.query.limit)
        : undefined;

      /**
       * decode url and use it to query DB
       */
      const data = await search(decodeURIComponent(query), limit, sort);

      ///
      response.send(data);
    } catch (error) {
      console.log(error);
      /// throw server error
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
      });
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

      response.status(200).send({
        status: 200,
        message: 'OK',
      });
    } catch (error) {
      console.log(error);
      response.status(500).send({
        status: 500,
        message: 'Internal server error',
      });
    }
  }
  /**
   * create a Redis data index
   */
  static async createAnIndex(_: any, response: Response): Promise<any> {
    try {
      await preBoot();

      response.status(200).send({
        status: 200,
        message: 'OK',
      });
    } catch (error) {
      response.status(500).send({
        status: 500,
        message: 'Internal server error',
      });
    }
  }
}
