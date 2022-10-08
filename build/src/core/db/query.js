"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = void 0;
const helpers_1 = require("../utils/helpers");
async function search(query, limit = 5, sort) {
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
                ? `${query}|~${query}|${query}*|"${query}"` // if has one letter
                : `${query}|${query}*`; // else
    console.log({ command });
    /**
     *
     */
    const results = await client.ft.search('idx:words', command, {
        SORTBY: {
            BY: 'word',
            DIRECTION: sort || 'ASC', //'DESC' or 'ASC (default if DIRECTION is not present)
        },
        // limit
        LIMIT: {
            from: 0,
            size: limit,
        },
    });
    console.log({
        results: results.documents[0],
    }, !results.documents[0] ? '🌈🌈🌈🔥🔥🔥' : '🟩❎');
    ///
    return {
        total: results.documents.length,
        data: results.documents.map((item) => {
            return { ...JSON.parse(item.value.$), ...{ uid: (0, helpers_1.uniqueId)(item.value.word) } };
        }),
    };
}
exports.search = search;
//# sourceMappingURL=query.js.map