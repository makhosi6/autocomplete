/* eslint-disable node/no-extraneous-import */
import {SchemaFieldTypes} from '@redis/search/dist/commands';
import {uniqueId} from '../utils';

export async function preBoot(client: any) {
  try {
    console.log('CREATE...');

    // Documentation: https://redis.io/commands/ft.create/
    await client.ft.create(
      'idx:words',
      {
        '$.word': {
          type: SchemaFieldTypes.TEXT,
          SORTABLE: 'UNF',
          AS: 'word',
        },
        '$.key': {type: SchemaFieldTypes.TAG, AS: 'key'},
        '$.uid': {type: SchemaFieldTypes.TEXT, AS: 'uid'},
      },
      {
        ON: 'JSON',
        PREFIX: 'noderedis:words',
      }
    );
  } catch (e: any) {
    if (e.message === 'Index already exists') {
      console.log('Index exists already, skipped creation.');
    } else {
      console.log('From preBoot');

      // Something went wrong, perhaps RediSearch isn't installed...
      console.error(e);
    }
  }
}

export async function feedValues(client: any) {
  try {
    console.log('Feed VALUES..');

    ///
    let num = 10000;

    const allFileContents = require('fs').readFileSync(
      `${__dirname}/data/${'y'}.txt`,
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
    await Promise.all([
      client.json.set('noderedis:words:2012', '$', {
        word: 'name',
        key: 'name',
        id: 'Z25peWZpcHB1eXl1cHBpZnlpbmc',
      }),
      client.json.set('noderedis:words:2011', '$', {
        word: 'game',
        key: 'game',
        id: 'Z25peWZpceqeqcq',
      }),
    ]);

    records.map(async (word: string) => {
      if (word === '') return;
      num++;
      console.log({
        num,
        word,
        key: word,
        id: uniqueId(word),
      });

      await client.json.set(`noderedis:words:${num}`, '$', {
        word,
        key: word,
        id: uniqueId(word),
      });
    });
  } catch (error) {
    console.log('From feed values');

    console.log(error);
  }
}
