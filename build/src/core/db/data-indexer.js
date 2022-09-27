"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedValues = exports.preBoot = void 0;
/* eslint-disable node/no-extraneous-import */
const commands_1 = require("@redis/search/dist/commands");
const utils_1 = require("../utils");
async function preBoot(client) {
    try {
        console.log('CREATE...');
        // Documentation: https://redis.io/commands/ft.create/
        await client.ft.create('idx:words', {
            '$.word': {
                type: commands_1.SchemaFieldTypes.TEXT,
                SORTABLE: 'UNF',
                AS: 'word',
            },
            '$.key': { type: commands_1.SchemaFieldTypes.TAG, AS: 'key' },
            '$.uid': { type: commands_1.SchemaFieldTypes.TEXT, AS: 'uid' },
        }, {
            ON: 'JSON',
            PREFIX: 'noderedis:words',
        });
    }
    catch (e) {
        if (e.message === 'Index already exists') {
            console.log('Index exists already, skipped creation.');
        }
        else {
            console.log('From preBoot');
            // Something went wrong, perhaps RediSearch isn't installed...
            console.error(e);
        }
    }
}
exports.preBoot = preBoot;
async function feedValues(client) {
    try {
        console.log('Feed VALUES..');
        ///
        let num = 10000;
        const allFileContents = require('fs').readFileSync(`${__dirname}/data/${'y'}.txt`, 'utf-8');
        /**
         * get all records
         */
        const records = allFileContents
            .split(/\r?\n/)
            .map((item) => item);
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
        records.map(async (word) => {
            if (word === '')
                return;
            num++;
            console.log({
                num,
                word,
                key: word,
                id: (0, utils_1.uniqueId)(word),
            });
            await client.json.set(`noderedis:words:${num}`, '$', {
                word,
                key: word,
                id: (0, utils_1.uniqueId)(word),
            });
        });
    }
    catch (error) {
        console.log('From feed values');
        console.log(error);
    }
}
exports.feedValues = feedValues;
//# sourceMappingURL=data-indexer.js.map