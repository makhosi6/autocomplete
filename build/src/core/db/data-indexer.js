"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preBoot = preBoot;
exports.feedValues = feedValues;
/* eslint-disable node/no-extraneous-import */
const commands_1 = require("@redis/search/dist/commands");
require("../utils/polyfill");
const helpers_1 = require("../utils/helpers");
async function preBoot(category) {
    try {
        console.log('CREATE...');
        ///set DB client
        const client = global.client;
        // Documentation: https://redis.io/commands/ft.create/
        await client.ft.create(`idx:words_${category}`, {
            '$.word': {
                type: commands_1.SchemaFieldTypes.TEXT,
                SORTABLE: 'UNF',
                AS: 'word',
            },
            '$.key': { type: commands_1.SchemaFieldTypes.TEXT, AS: 'key' },
            // '$.uid': {type: SchemaFieldTypes.TEXT, AS: 'uid'},
        }, {
            ON: 'JSON',
            PREFIX: `redis:words_${category}`,
            STOPWORDS: '0',
        });
    }
    catch (e) {
        if (e.message === 'Index already exists') {
            console.log('Index exists already, skipped creation.');
        }
        else {
            console.log('From preBoot');
            // Something went wrong, perhaps RediSearch isn't installed...
            console.log(e);
        }
    }
}
async function feedValues(category) {
    try {
        let num_x = 0;
        ///set DB client
        const client = global.client;
        console.log('Feed VALUES..');
        ///
        // let num = start || Math.floor(Math.random() * 1203333);
        const allFileContents = require('fs').readFileSync(`${__dirname}/data/${category}.txt`, 'utf-8');
        /**
         * get all records
         */
        const records = allFileContents
            .split(/\r?\n/)
            .map((item) => item)
            .sort(function (a, b) {
            const x = a.trim();
            const y = b.trim();
            return x === y ? 0 : x < y ? 1 : -1;
        });
        console.log('Records', { records: records.length, allFileContents: allFileContents.length });
        /**
         * feed data into redis
         */
        const SUGGESTIONS_KEY = 'sug:words_all';
        records.map(async (word) => {
            num_x++;
            if (word === '' || !word)
                return;
            const key = `redis:words_${category}:${word}`;
            console.log('Feeding word to key', { word, key });
            await client.json.set(key, '$', {
                word: (0, helpers_1.redisEscape)(word),
                key: word,
                // uid: uniqueId(word),
            });
            try {
                await client.ft.sugadd(SUGGESTIONS_KEY, word, 1);
            }
            catch (e) {
                console.log('Failed to add suggestion', { word, error: e });
            }
        });
    }
    catch (error) {
        console.log('From feed values');
        console.log(error);
    }
}
//# sourceMappingURL=data-indexer.js.map