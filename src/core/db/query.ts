export async function search(query: string) {
  ///set DB client
  const client = (global as any).client;
  /**
   *
   */

  const results = await client.ft.search('idx:words', `@key:{${query}*}`);
  ///
  return {
    total: results.total,
    data: results.documents.map((item: any) => item.value),
  };
}
