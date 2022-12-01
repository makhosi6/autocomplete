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
function search(query, limit = 5, sort) {
    return __awaiter(this, void 0, void 0, function* () {
        ///set DB client
        const client = global.client;
        const asArr = query.split(' ');
        ///
        const isTwoLetterWord = asArr.length > 1;
        //
        if (isTwoLetterWord) {
            asArr[asArr.length - 1] = '~' + asArr[asArr.length - 1];
            console.log({ asArr });
        }
        /**
         * if it a ONE letter query
         */
        const command = isTwoLetterWord
            ? asArr.join(' ') // if its a phrase(two words or more)
            : (0, helpers_1.hasSymbol)(query) // if has special characters
                ? `${query}*`
                : query.length < 2
                    ? `${query}|${query}*|'${query}'` // if has one letter
                    : `${query}|${query}*`; // else
        console.log({ command });
        const cmd = `"${query}"` + '|' + query + '|' + query + '*|' + query;
        console.log({ cmd });
        /**
         *  https://github.com/padolsey/relevancy.js/
         */
        const results = yield client.ft.search('idx:words', `@word: ${command}`, {
            // SORTBY: {
            //   BY: 'word',
            //   DIRECTION: sort || 'ASC', //'DESC' or 'ASC (default if DIRECTION is not present)
            // },
            // limit
            LIMIT: {
                from: 0,
                size: 30,
            },
        });
        console.log({
            results: results.documents,
        }, 
        // {
        //   results: results.documents.map((x: any) => x.value.word).sortBy(query),
        // },
        !results.documents[0]
            ? `🌈🌈🌈🔥🔥🔥 HAS ${results.documents.length} documents`
            : `🟩❎ HAS ${results.documents.length} documents`);
        ///
        return {
            total: results.documents.length,
            data: results.documents.map((doc) => doc.value.word).sortBy(query),
        };
        // const spellCheck = client.ft.spellcheck();
    });
}
exports.search = search;
