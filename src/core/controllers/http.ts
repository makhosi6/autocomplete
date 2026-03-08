import {Request, Response} from 'express';
import {feedValues, preBoot} from '../db/data-indexer';
import {aggregate, search, suggest} from '../db/query';

export class RedisHttpController {
  constructor() {}

  /**
   * Autocomplete - get all words that closely match the query, sorted by relevance
   * - Supports path: /api/v1/autocomplete/{query}
   * - Supports query param: /api/v1/autocomplete?q={query}
   * - Default limit: 10, max: 25
   */
  static async search(request: Request, response: Response): Promise<any> {
    try {
      console.log('[Autocomplete] Incoming request', {
        path: request.path,
        params: request.params,
        query: request.query,
        ip: request.ip,
      });

      const query: string =
        request.params.query ||
        request.params.key ||
        request.query.q?.toString() ||
        '';

      if (!query.trim()) {
        console.log('[Autocomplete] Missing query string');
        response.status(400).json({
          status: 400,
          message: 'Bad Request',
          error: 'Query is required. Use /autocomplete/{query} or ?q=',
        });
        return;
      }

      const sort =
        (request.query.sort?.toString() || 'ASC').toUpperCase() === 'DESC'
          ? 'DESC'
          : 'ASC';

      console.log('[Autocomplete] Sort option', {sort});

      const rawLimit = request.query.limit
        ? Number(request.query.limit)
        : undefined;
      const limit =
        rawLimit === 0
          ? 10
          : rawLimit && rawLimit > 25
            ? 25
            : rawLimit && rawLimit < 1
              ? 10
              : rawLimit ?? 10;

      console.log('[Autocomplete] Limit option', {rawLimit, limit});

      const decodedQuery = decodeURIComponent(query).trim();
      console.log('[Autocomplete] Final query string', {decodedQuery});

      const data = await search(
        decodedQuery,
        limit,
        sort
      );

      console.log('[Autocomplete] Search response summary', {
        total: data?.total,
        sample: Array.isArray(data?.data) ? data.data.slice(0, 5) : [],
      });

      response.json(data);
    } catch (error) {
      console.log('[Autocomplete] Error during getAll', error);
      /// throw server error
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
      });
    }
  }
  static async aggregate(request: Request, response: Response): Promise<any> {
    try {
      console.log('[Autocomplete] Incoming request', {
        path: request.path,
        params: request.params,
        query: request.query,
        ip: request.ip,
      });

      const query: string =
        request.params.query ||
        request.params.key ||
        request.query.q?.toString() ||
        '';
        
      if (!query.trim()) {
        console.log('[Autocomplete] Missing query string');
        response.status(400).json({
          status: 400,
          message: 'Bad Request',
          error: 'Query is required. Use /autocomplete/{query} or ?q=',
        });
        return;
      }

      const decodedQuery = decodeURIComponent(query).trim();
      console.log('[Autocomplete] Final query string', {decodedQuery});

      const sort =
        (request.query.sort?.toString() || 'ASC').toUpperCase() === 'DESC'
          ? 'DESC'
          : 'ASC';

      const limit = request.query.limit ? Number(request.query.limit) : 10;

      const data = await aggregate(decodedQuery, limit, sort);

      console.log('[Autocomplete] Aggregate response summary', {
        total: data?.total,
        sample: Array.isArray(data?.data) ? data.data.slice(0, 5) : [],
      });

      response.json(data);
    }
    catch (error) {
      console.log('[Autocomplete] Error during aggregate', error);
      /// throw server error
      response.status(500).json({status: 500, message: 'Internal server error'});
    }
  }

  static async suggest(request: Request, response: Response): Promise<any> {
    try {
      console.log('[Autocomplete] Incoming request', {
        path: request.path,
        params: request.params,
        query: request.query,
        ip: request.ip,
      });

      const query: string =
        request.params.query ||
        request.params.key ||
        request.query.q?.toString() ||
        '';
        
      if (!query.trim()) {
        console.log('[Autocomplete] Missing query string');
        response.status(400).json({
          status: 400,
          message: 'Bad Request',
          error: 'Query is required. Use /autocomplete/{query} or ?q=',
        });
        return;
      }

      const decodedQuery = decodeURIComponent(query).trim();
      console.log('[Autocomplete] Final query string', {decodedQuery});

      const sort =
        (request.query.sort?.toString() || 'ASC').toUpperCase() === 'DESC'
          ? 'DESC'
          : 'ASC';

      const limit = request.query.limit ? Number(request.query.limit) : 10;

      const data = await suggest(decodedQuery, limit, sort);

      console.log('[Autocomplete] Suggest response summary', {
        total: data?.total,
        sample: Array.isArray(data?.data) ? data.data.slice(0, 5) : [],
      });

      response.json(data);
    } catch (error) {
      console.log('[Autocomplete] Error during suggest', error);
      /// throw server error
      response.status(500).json({status: 500, message: 'Internal server error'});
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
  static async createAnIndex(
    request: Request,
    response: Response
  ): Promise<any> {
    try {
      /**
       * category
       */
      const category: string = request.params.category;

      //
      await preBoot(category);

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
