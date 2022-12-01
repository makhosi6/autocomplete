import {RedisClientType} from 'redis';
import {hasSymbol, uniqueId} from '../utils/helpers';
import '../utils/polyfill';

export async function search(query: string, limit = 5, sort: any) {
  ///set DB client
  const client = (global as any).client;

  const asArr = query.split(' ');
  ///
  const isTwoLetterWord = asArr.length > 1;

  //
  if (isTwoLetterWord) {
    asArr[asArr.length - 1] = '~' + asArr[asArr.length - 1];
    console.log({asArr});
  }

  /**
   * if it a ONE letter query
   */

  const command = isTwoLetterWord
    ? asArr.join(' ') // if its a phrase(two words or more)
    : hasSymbol(query) // if has special characters
    ? `${query}*`
    : query.length < 2
    ? `${query}|${query}*|'${query}'` // if has one letter
    : `${query}|${query}*`; // else

  console.log({command});
  const cmd = `"${query}"` + '|' + query + '|' + query + '*|' + query;
  console.log({cmd});

  const results = await client.ft.search('idx:words', `@word: ${command}`, {
    // SORTBY: {
    //   BY: 'word',
    //   DIRECTION: sort || 'ASC', //'DESC' or 'ASC (default if DIRECTION is not present)
    // },
    // limit
    LIMIT: {
      from: 0,
      size: 30,
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

  ///
  return {
    total: results.documents.length,
    /**
     *  https://github.com/padolsey/relevancy.js/
     */
    data: results.documents.map((doc: any) => doc.value.word).sortBy(query),
  };
  // const spellCheck = client.ft.spellcheck();
}
