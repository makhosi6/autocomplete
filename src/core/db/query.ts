import {hasSymbol, uniqueId} from '../utils';

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
    ? `${query}|~${query}|${query}*` // if has one letter
    : `${query}|${query}*`; // else

  console.log({command});

  /**
   *
   */
  const results = await client.ft.search('idx:words', command, {
    SORTBY: {
      BY: 'word',
      DIRECTION: sort || 'ASC', //'DESC' or 'ASC (default if DIRECTION is not present)
    },
    // limit
    LIMIT: {
      from: 0,
      size: limit,
    },
  });

  console.log(
    {
      results: results.documents[0],
    },
    !results.documents[0] ? '🌈🌈🌈🔥🔥🔥' : '🟩❎'
  );

  ///
  return {
    total: results.documents.length,
    data: results.documents.map((item: any) => {
      return {...JSON.parse(item.value.$), ...{uid: uniqueId(item.value.word)}};
    }),
  };
}
