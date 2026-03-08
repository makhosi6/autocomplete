import {redisEscape} from '../utils/helpers';

/**
 * Get the RediSearch index key based on the query's first character.
 * - Letters a-z (case‑insensitive) → idx:words_{letter}
 * - Digits 0-9 → idx:words_0
 * - Other → idx:words_words_lowercase
 */
function getIndexTarget(q: string): string {
  const first = q.trim()[0]?.toLowerCase();
  if (!first) return 'words_lowercase';
  if (/[a-z]/.test(first)) return first;
  if (/[0-9]/.test(first)) return '0';
  return 'words_lowercase';
}

const WORD_SEPARATORS = /[\s\-_.,;:'"()]/;
const SUGGESTIONS_KEY = 'sug:words_all';
/**
 * Assign a relevance tier to a candidate word for a given query.
 * Tiers (lower is better):
 * 0 - Exact match (case‑insensitive)
 * 1 - Prefix match and the candidate is a single word (no separators)
 * 2 - Prefix match but candidate contains word separators (phrase/compound)
 * 3 - Other matches (e.g., infix)
 */
function getRank(word: string, query: string): number {
  const w = word.toLowerCase();
  const q = query.toLowerCase();

  const exact = w === q;
  const starts = w.startsWith(q);
  const singleWord = !WORD_SEPARATORS.test(w);

  if (exact) return 0;
  if (starts && singleWord) return 1;
  if (starts) return 2;
  return 3;
}

interface RankedWord {
  word: string;
  tier: number;
  len: number;
  lower: string;
}

function sortByRelevance(words: string[], query: string): RankedWord[] {
  return [...words]
    .map(word => ({
      word,
      tier: getRank(word, query),
      len: word.length,
      lower: word.toLowerCase(),
    }))
    .sort((a, b) => {
      // 1. Tier (0 best)
      if (a.tier !== b.tier) return a.tier - b.tier;
      // 2. Shorter strings first
      if (a.len !== b.len) return a.len - b.len;
      // 3. Alphabetical (case‑insensitive)
      return a.lower.localeCompare(b.lower);
    });
}

interface RediSearchDoc {
  value?: {key: string};
}

/**
 * Search for words that closely match the query, sorted by relevance.
 * Uses exact match, prefix match, and phrase match for autocomplete.
 *
 * @param q - query string
 * @param limit - max results (default 10)
 * @param sort - 'ASC' (most relevant first) or 'DESC' (least relevant first)
 */
export async function search(
  q: string,
  limit = 10,
  sort: 'ASC' | 'DESC' = 'ASC'
): Promise<{total: number; data: string[]}> {
  const trimmed = q.trim();
  console.log('[Autocomplete][search] Input', {q, limit, sort});

  if (!trimmed) {
    console.log('[Autocomplete][search] Empty trimmed query');
    return {total: 0, data: []};
  }

  const target = getIndexTarget(trimmed);
  const client = (global as any).client;

  // Tokenize the query so autocomplete can match any word segment
  const tokens = trimmed
    .split(/\s+/)
    .map(t => t.trim())
    .filter(Boolean);
  const escapedTokens = tokens.map(redisEscape);

  console.log('[Autocomplete][search] Tokens', {tokens, escapedTokens});

  // Build an OR query across tokens: exact | prefix* | "phrase"
  const parts =
    escapedTokens.length > 0
      ? escapedTokens.map(token => `(${token} | ${token}* | "${token}")`)
      : [redisEscape(trimmed)];

  const command = parts.join(' | ');

  console.log('[Autocomplete][search] Final command', {
    index: `idx:words_${target}`,
    command,
    limit,
  });

  const results = await client.ft.search(`idx:words_${target}`, command, {
    LIMIT: {from: 0, size: Math.min(limit * 3, 100)}, // fetch extra for relevance sort
  });

  const words = (results.documents || [])
    .map((doc: RediSearchDoc) => doc.value?.key)
    .filter(Boolean) as string[];

  const sorted = sortByRelevance(words, trimmed);
  const output = sorted.map(item => item.word).slice(0, limit);

  console.log('[Autocomplete][search] Raw results', {
    documents: results.documents?.length,
    words: words.length,
    output: output.slice(0, 10),
  });

  return {
    total: output.length,
    data: sort.toUpperCase() === 'DESC' ? output.reverse() : output,
  };
}

/**
 * Search using FT.AGGREGATE.
 * Fetches documents where the 'key' field starts with the query prefix,
 * computes a simple tier score in Redis, then returns all matches.
 * Application‑side sorting is still applied for length and alphabet.
 */
export async function aggregate(
  q: string,
  limit = 10,
  sort: 'ASC' | 'DESC' = 'ASC'
): Promise<{ total: number; data: string[]; sorted: RankedWord[] }> {
  const trimmed = q.trim();
  console.log('[Autocomplete][searchAggregate] Input', { q, limit, sort });

  if (!trimmed) {
    return { total: 0, data: [], sorted: [] };
  }

  const target = getIndexTarget(trimmed);
  const client = (global as any).client;
  if (!client) {
    throw new Error('Redis client not available');
  }

  // Escape the query for use in the filter
  const escaped = redisEscape(trimmed);

  // Build an AGGREGATE query:
  // 1. Filter by prefix on the 'key' field (TAG or TEXT)
  // 2. Load the 'key' value
  // 3. Compute a basic tier score:
  //    - tier0: exact match (key == query)
  //    - tier1: prefix match and no separators (crude: length <= query length? Not perfect)
  //    - tier2: prefix match (others)
  //    - tier3: everything else (not used here because we filter by prefix)
  //    Because we only retrieve prefix matches, tier3 won't appear.
  // 4. Sort by this score (ASC), then by length, then alphabetically (case‑insensitive)
  // 5. Limit to (limit*3) to allow final application sort

  // Note: RediSearch's APPLY does not have a direct "contains separator" function.
  // We approximate tier1 by checking if the key length is exactly the query length
  // (possible exact match) or if the key has no spaces/hyphens? Hard.
  // Instead, we fetch all prefix matches and rely on application sort.
  // This aggregate query simply adds a "tier" field: 0 for exact, 2 for prefix (others).
  // We'll then sort in the app to separate tier1 (single‑word) from tier2 (multi‑word).

  const aggregateCommand = [
    `idx:words_${target}`,
    `@key:{${escaped}*`,                      // prefix filter on 'key' field (TAG)
    'LOAD', '1', '@key',                      // return the key field
    'APPLY', `'@key == "${escaped}" ? 0 : 2'`, 'AS', 'tier',   // 0 for exact, 2 for others
    'SORTBY', '2', '@tier', 'ASC', '@key', 'ASC',  // sort by tier then key (alphabetical)
    'LIMIT', '0', String(Math.min(limit * 3, 100))
  ];

  console.log('[Autocomplete][searchAggregate] Command', aggregateCommand);

  try {
    const results = await client.ft.aggregate(...aggregateCommand);

    // results is an object with 'total' and 'rows' (each row is an array of [field, value])
    const rows = results.rows || [];
    const words = rows.map((row: any[]) => {
      // row format: ['key', value, 'tier', value]
      const keyIndex = row.indexOf('key');
      return keyIndex >= 0 ? row[keyIndex + 1] : null;
    }).filter(Boolean) as string[];

    // Apply full relevance sort in application
    const sorted = sortByRelevance(words, trimmed);
    const output = sorted.map(item => item.word).slice(0, limit);

    console.log('[Autocomplete][searchAggregate] Results', {
      fetched: words.length,
      output: output.slice(0, 10)
    });

    return {
      total: output.length,
      data: sort.toUpperCase() === 'DESC' ? output.reverse() : output,
      sorted
    };
  } catch (error) {
    console.error('[Autocomplete][searchAggregate] Failed', error);
    throw error;
  }
}

export async function suggest(
  q: string,
  limit = 10,
  sort: 'ASC' | 'DESC' = 'ASC'
): Promise<{total: number; data: string[]; sorted: RankedWord[]}> {
  const trimmed = q.trim();
  console.log('[Autocomplete][search] Input', {q, limit, sort});

  if (!trimmed) {
    console.log('[Autocomplete][search] Empty trimmed query');
    return {total: 0, data: [], sorted: []};
  }

  const client = (global as any).client;
  if (!client) {
    throw new Error('Redis client not available');
  }

  try {
    // Fetch up to limit*3 suggestions (max 100) – we'll re-rank them
    const results = await client.ft.sugget(SUGGESTIONS_KEY, trimmed, {
      MAX: Math.min(limit * 3, 100),
      WITHSCORES: false, // we don't need the built-in scores
      FUZZY: false, // optional; set to true for fuzzy matching
    });

    // FT.SUGGET returns an array of strings (the suggestions)
    const words = results || [];

    const sorted = sortByRelevance(words, trimmed);
    const output = sorted.map(item => item.word).slice(0, limit);

    console.log('[Autocomplete][search] Results', {
      fetched: words.length,
      output: output.slice(0, 10),
    });

    return {
      total: output.length,
      data: sort.toUpperCase() === 'DESC' ? output.reverse() : output,
      sorted,
    };
  } catch (error) {
    console.error('[Autocomplete][search] FT.SUGGET failed', error);
    throw error;
  }
}
