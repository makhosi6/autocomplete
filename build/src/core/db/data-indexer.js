"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedValues = exports.preBoot = void 0;
/* eslint-disable node/no-extraneous-import */
const commands_1 = require("@redis/search/dist/commands");
const utils_1 = require("../utils");
async function preBoot() {
    try {
        console.log('CREATE...');
        ///set DB client
        const client = global.client;
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
async function feedValues(category) {
    try {
        ///set DB client
        const client = global.client;
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
        records.map(async (word) => {
            if (word === '')
                return;
            num++;
            console.log({
                num,
                word,
                key: word.toLowerCase(),
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