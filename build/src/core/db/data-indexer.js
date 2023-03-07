"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedValues = exports.preBoot = void 0;
/* eslint-disable node/no-extraneous-import */
const commands_1 = require("@redis/search/dist/commands");
require("../utils/polyfill");
const helpers_1 = require("../utils/helpers");
function preBoot() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('CREATE...');
            ///set DB client
            const client = global.client;
            // Documentation: https://redis.io/commands/ft.create/
            yield client.ft.create('idx:words', {
                '$.word': {
                    type: commands_1.SchemaFieldTypes.TEXT,
                    SORTABLE: 'UNF',
                    AS: 'word',
                },
                '$.key': { type: commands_1.SchemaFieldTypes.TEXT, AS: 'key' },
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
                console.log(e);
            }
        }
    });
}
exports.preBoot = preBoot;
function feedValues(category) {
    return __awaiter(this, void 0, void 0, function* () {
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
                const x = a.toUpperCase(), y = b.toUpperCase();
                return x === y ? 0 : x < y ? 1 : -1;
            });
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            // .sort((a, b) => a - b);
            /**
             * feed data into redis
             */
            records.map((word) => __awaiter(this, void 0, void 0, function* () {
                num_x++;
                if (word === '' || !word)
                    return;
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
                yield client.json.set(`redis:words:${word}`, '$', {
                    word: (0, helpers_1.redisEscape)(word),
                    key: word,
                    // uid: uniqueId(word),
                });
            }));
        }
        catch (error) {
            console.log('From feed values');
            console.log(error);
        }
    });
}
exports.feedValues = feedValues;
