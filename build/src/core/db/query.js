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
exports.search = void 0;
const helpers_1 = require("../utils/helpers");
require("../utils/polyfill");
/**
 *
 * @param q query string
 * @param limit - limit a number between 1 and 10
 * @param sort 'DESC' or 'ASC
 * @returns  {Promise<Object>}
 */
function search(q, limit = 5, sort) {
    return __awaiter(this, void 0, void 0, function* () {
        /// prepare string for redis, remove or escape special characters
        const query = (0, helpers_1.redisEscape)(q.trim());
        ///set DB client
        const client = global.client;
        /// redis query command
        const command = `"${query}"|${query}*`;
        console.log({ command });
        const results = yield client.ft.search('idx:words', `@word:${command}`);
        //{
        // SORTBY: {
        //   BY: 'word',
        //   DIRECTION: sort || 'ASC', //'DESC' or 'ASC (default if DIRECTION is not present)
        // },
        // limit
        // LIMIT: {
        //   from: 0,
        //   size: 1000,
        // },
        //}
        // );
        console.log(
        // {
        //   results: results.documents,
        // },
        // {
        //   results: results.documents.map((x: any) => x.value.word).sortBy(query),
        // },
        !results.documents[0]
            ? `🌈🌈🔥🔥 HAS ${results.documents.length} documents`
            : `🟩❎ HAS ${results.documents.length} documents`);
        /**
         * re-arrange results by relevancy and limit to a given number
         */
        const output = results.documents
            .map((doc) => doc.value.key)
            .sortBy(query)
            .slice(0, limit);
        /**
         * return data as an array and its length
         */
        return {
            total: output.length,
            /**
             *  https://github.com/padolsey/relevancy.js/
             */
            data: sort.toUpperCase() === 'DESC' ? output.reverse() : output,
        };
        // const spellCheck = client.ft.spellcheck();
    });
}
exports.search = search;
