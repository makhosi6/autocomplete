export async function search(client: any, query: string) {
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
