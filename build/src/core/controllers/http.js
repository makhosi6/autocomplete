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
exports.RedisHttpController = void 0;
const data_indexer_1 = require("../db/data-indexer");
const query_1 = require("../db/query");
class RedisHttpController {
    constructor() { }
    /**
     * index - get one
     */
    static index() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    /**
     * index - get all with limit
     * - defualt is 5
     * - maximum is 10
     * - minimum is 1
     */
    static getAll(request, response) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //query value
                const query = request.params.key || ((_a = request.query.q) === null || _a === void 0 ? void 0 : _a.toString()) || '';
                /**
                 * bad request guard
                 */
                if (!query) {
                    response.send({
                        status: 400,
                        message: 'Bad Request',
                    });
                    return;
                }
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
                const data = yield (0, query_1.search)(decodeURIComponent(query), limit, sort);
                ///
                response.send(data);
            }
            catch (error) {
                console.log(error);
                /// throw server error
                response.status(500).json({
                    status: 500,
                    message: 'Internal server error',
                });
            }
        });
    }
    /**
     * feed data into Redis from a file
     */
    static feedData(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                /**
                 * category
                 */
                const category = request.params.category;
                //feed values to Redis
                yield (0, data_indexer_1.feedValues)(decodeURIComponent(category));
                response.status(200).send({
                    status: 200,
                    message: 'OK',
                });
            }
            catch (error) {
                console.log(error);
                response.status(500).send({
                    status: 500,
                    message: 'Internal server error',
                });
            }
        });
    }
    /**
     * create a Redis data index
     */
    static createAnIndex(_, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, data_indexer_1.preBoot)();
                response.status(200).send({
                    status: 200,
                    message: 'OK',
                });
            }
            catch (error) {
                response.status(500).send({
                    status: 500,
                    message: 'Internal server error',
                });
            }
        });
    }
}
exports.RedisHttpController = RedisHttpController;
