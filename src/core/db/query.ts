import {Request} from 'express';
import {redisEscape} from '../utils/helpers';
import '../utils/polyfill';
/**
 *
 * @param q query string
 * @param limit - limit a number between 1 and 10
 * @param sort 'DESC' or 'ASC
 * @returns  {Promise<Object>}
 */
export async function search(q: string, limit = 5, sort: any): Promise<Object> {
  /// prepare string for redis, remove or escape special characters
  const query = redisEscape(q.trim());
  ///
  const target = q[0].toLowerCase();
  ///set DB client
  const client = (global as any).client;

  /// redis query command
  const command = `${query} | ${query}* | "${query}"`;
  console.log({command});
  console.log({query});

  const results = await client.ft.search(`idx:words_${target}`, command);

  console.log(
    // {
    //   results: results.documents,
    // },
    // {
    //   results: results.documents.map((x: any) => x.value.word).sortBy(query),
    // },
    !results.documents[0]
      ? `🌈🌈🔥🔥 HAS ${results.documents.length} documents`
      : `🟩❎ HAS ${results.documents.length} documents`
  );

  /**
   * re-arrange results by relevancy and limit to a given number
   */
  const output = results.documents
    .map((doc: any) => doc.value.key)
    .sortBy(query)
    .slice(0, results.length);
  /**
   * return data as an array and its length
   */
  return {
    total: output.length,
    /**
     *  https://github.com/padolsey/relevancy.js/
     */
    data: sort.toUpperCase() === 'DESC' ? output.reverse() : output,
  };
  // const spellCheck = client.ft.spellcheck();
}

// https://redis.io/docs/stack/search/reference/query_syntax/
//make three requests
class _Request {
  // - any word that match's
  static async exact(query: string): Promise<Object> {
    return {};
  }
  // - any word that starts with
  static async startWith(query: string): Promise<Object> {
    return {};
  }
  // - or any that contains
  static async contains(query: string): Promise<Object> {
    return {};
  }
}
