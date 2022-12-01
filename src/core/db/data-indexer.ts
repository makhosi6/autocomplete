/* eslint-disable node/no-extraneous-import */
import {SchemaFieldTypes} from '@redis/search/dist/commands';
import '../utils/polyfill';
import {uniqueId} from '../utils/helpers';

export async function preBoot() {
  try {
    console.log('CREATE...');

    ///set DB client
    const client = (global as any).client;

    // Documentation: https://redis.io/commands/ft.create/
    await client.ft.create(
      'idx:words',
      {
        '$.word': {
          type: SchemaFieldTypes.TEXT,
          SORTABLE: 'UNF',
          AS: 'word',
        },
        // '$.key': {type: SchemaFieldTypes.TAG, AS: 'key'},
        // '$.uid': {type: SchemaFieldTypes.TEXT, AS: 'uid'},
      },
      {
        ON: 'JSON',
        PREFIX: 'redis:words',
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
      .map((item: string): string => item);

    /**
     * feed data into redis
     */

    records.map(async (word: string) => {
      num_x++;

      if (word === '') return;

      await client.json.set(`redis:words:${word.replaceAll(' ', '')}`, '$', {
        word,
        // key: word.replaceAll(' ', ''),
        uid: uniqueId(word),
      });
    });
    console.log({num_x});
  } catch (error) {
    console.log('From feed values');

    console.log(error);
  }
}
