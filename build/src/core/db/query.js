"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = void 0;
async function search(query, limit = 5) {
    ///set DB client
    const client = global.client;
    /**
     *
     */
    const results = await client.ft.search('idx:words', `@key:{${query}*}`, {
        // limit
        LIMIT: {
            from: 0,
            size: limit,
        },
    });
    ///
    return {
        total: results.documents.length,
        data: results.documents.map((item) => item.value),
    };
}
exports.search = search;
//# sourceMappingURL=query.js.map