import {hasSymbol} from '../utils';

export async function search(query: string, limit = 5) {
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
    ? asArr.join(' ')
    : hasSymbol(query)
    ? `${query}*`
    : query.length < 2
    ? `${query}|~${query}`
    : `${query}|${query}*`;

  console.log({command});

  /**
   *
   */
  const results = await client.ft.search('idx:words', command, {
    // limit
    LIMIT: {
      from: 0,
      size: limit,
    },
  });

  console.log({
    one: results.documents[0],
  });

  ///
  return {
    total: results.documents.length,
    data: results.documents.map((item: any) => item.value),
  };
}
