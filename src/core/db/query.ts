import {RedisClientType} from 'redis';
import {hasSymbol, redisEscape, uniqueId} from '../utils/helpers';
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

  ///set DB client
  const client = (global as any).client;

  /// redis query command
  const command = `${query}|${query}*|"${query}"`;
  console.log({command});

  const results = await client.ft.search('idx:words', `@word: ${command}`, {
    // SORTBY: {
    //   BY: 'word',
    //   DIRECTION: sort || 'ASC', //'DESC' or 'ASC (default if DIRECTION is not present)
    // },
    // limit
    LIMIT: {
      from: 0,
      size: 20,
    },
  });

  console.log(
    // {
    //   results: results.documents,
    // },
    // {
    //   results: results.documents.map((x: any) => x.value.word).sortBy(query),
    // },
    !results.documents[0]
      ? `🌈🌈🌈🔥🔥🔥 HAS ${results.documents.length} documents`
      : `🟩❎ HAS ${results.documents.length} documents`
  );

  /**
   * re-arrange results by relevancy and limit to a given number
   */
  const output = results.documents
    .map((doc: any) => doc.value.key)
    .sortBy(query)
    .slice(0, limit);
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
