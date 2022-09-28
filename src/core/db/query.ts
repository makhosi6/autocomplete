export async function search(query: string, limit = 5) {
  ///set DB client
  const client = (global as any).client;
  /**
   * if it a ONE letter query
   */
  const command = query.length < 2 ? `@key:{${query}}` : `@key:{${query}*}`;

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
