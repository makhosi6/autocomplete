export async function search(query: string, limit = 5) {
  ///set DB client
  const client = (global as any).client;
  /**
   *
   */

  const results = await client.ft.search('idx:words', `@key:{${query}*}`, {
    // limit
    LIMIT: {
      from: 0,
      size: limit,
    },
  });
  ///
  return {
    total: results.documents.length,
    data: results.documents.map((item: any) => item.value),
  };
}
