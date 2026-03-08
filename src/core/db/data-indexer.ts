/* eslint-disable prefer-arrow-callback */
import {indices} from './../utils/helpers';
/* eslint-disable node/no-extraneous-import */
import {SchemaFieldTypes} from '@redis/search/dist/commands';
import '../utils/polyfill';
import {redisEscape, uniqueId} from '../utils/helpers';

export async function preBoot(category: string) {
  try {
    console.log('CREATE...');

    ///set DB client
    const client = (global as any).client;

    // Documentation: https://redis.io/commands/ft.create/
    await client.ft.create(
      `idx:words_${category}`,
      {
        '$.word': {
          type: SchemaFieldTypes.TEXT,
          SORTABLE: 'UNF',
          AS: 'word',
        },
        '$.key': {type: SchemaFieldTypes.TEXT, AS: 'key'},
        // '$.uid': {type: SchemaFieldTypes.TEXT, AS: 'uid'},
      },
      {
        ON: 'JSON',
        PREFIX: `redis:words_${category}`,
        STOPWORDS: '0',
      }
    );
  } catch (e: any) {
    if (e.message === 'Index already exists') {
      console.log('Index exists already, skipped creation.');
    } else {
      console.log('From preBoot');

      // Something went wrong, perhaps RediSearch isn't installed...
      console.log(e);
    }
  }
}

export async function feedValues(category: string) {
  try {
    let num_x = 0;
    ///set DB client
    const client = (global as any).client;

    console.log('Feed VALUES..');

    ///
    // let num = start || Math.floor(Math.random() * 1203333);

    const allFileContents = require('fs').readFileSync(
      `${__dirname}/data/${category}.txt`,
      'utf-8'
    );

    /**
     * get all records
     */
    const records: Array<string> = allFileContents
      .split(/\r?\n/)
      .map((item: string): string => item)
      .sort(function (a: string, b: string) {
        const x = a.trim();
        const y = b.trim();
        return x === y ? 0 : x < y ? 1 : -1;
      });
    console.log('Records', {records: records.length, allFileContents: allFileContents.length});

    /**
     * feed data into redis
     */

    const SUGGESTIONS_KEY = 'sug:words_all';

    records.map(async (word: string) => {
      num_x++;

      if (word === '' || !word) return;
      const key = `redis:words_${category}:${word}`;
      console.log('Feeding word to key', {word, key});

      await client.json.set(key, '$', {
        word: redisEscape(word),
        key: word,
        // uid: uniqueId(word),
      });

      try {
        await client.ft.sugadd(SUGGESTIONS_KEY, word, 1);
      } catch (e) {
        console.log('Failed to add suggestion', {word, error: e});
      }
    });
  } catch (error) {
    console.log('From feed values');
    console.log(error);
  }
}
