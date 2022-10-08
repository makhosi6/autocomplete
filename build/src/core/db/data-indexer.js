"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedValues = exports.preBoot = void 0;
/* eslint-disable node/no-extraneous-import */
const commands_1 = require("@redis/search/dist/commands");
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
            // '$.key': {type: SchemaFieldTypes.TAG, AS: 'key'},
            // '$.uid': {type: SchemaFieldTypes.TEXT, AS: 'uid'},
        }, {
            ON: 'JSON',
            PREFIX: 'redis:words',
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
            .map((item) => item);
        /**
         * feed data into redis
         */
        records.map(async (word) => {
            num_x++;
            if (word === '')
                return;
            await client.json.set(`redis:words:${num_x}`, '$', {
                word,
                // key: word,
                // uid: uniqueId(word),
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