"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisHttpController = void 0;
const data_indexer_1 = require("../db/data-indexer");
const query_1 = require("../db/query");
class RedisHttpController {
    constructor() { }
    /**
     * index - get one
     */
    static async index() { }
    /**
     * index - get all with limit
     * - defualt is 5
     * - maximum is 10
     * - minimum is 1
     */
    static async getAll(request, response) {
        try {
            //query value
            const query = request.params.key;
            /**
             * optional sort ['DESC' | 'ASC' ]
             *
             */
            const sort = request.query.sort ? request.query.sort : 'ASC';
            /**
             * verbose
             */
            const isVerbose = Boolean(request.query.verbose);
            /**
             * optional limit
             * - defualt is 5
             * - maximum is 10
             * - minimum is 1
             */
            const limit = request.query.limit
                ? Number(request.query.limit) === 0
                    ? 5
                    : /// if greater than 10 default to 10
                        Number(request.query.limit) > 10
                            ? 10
                            : Number(request.query.limit)
                : undefined;
            /**
             * decode url and use it to query DB
             */
            const data = await (0, query_1.search)(decodeURIComponent(query), limit, sort);
            ///
            response.send(data);
        }
        catch (error) {
            console.log(error);
            /// throw server error
            response.sendStatus(500);
        }
    }
    /**
     * feed data into Redis from a file
     */
    static async feedData(request, response) {
        try {
            /**
             * category
             */
            const category = request.params.category;
            //feed values to Redis
            await (0, data_indexer_1.feedValues)(decodeURIComponent(category));
            response.status(200).send('Done');
        }
        catch (error) {
            console.log(error);
            response.status(500).send('Done');
        }
    }
    /**
     * create a Redis data index
     */
    static async createAnIndex(_, response) {
        try {
            await (0, data_indexer_1.preBoot)();
            response.status(200).send('Done');
        }
        catch (error) {
            response.sendStatus(500);
        }
    }
}
exports.RedisHttpController = RedisHttpController;
//# sourceMappingURL=http.js.map