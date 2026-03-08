"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = void 0;
const helpers_1 = require("../core/utils/helpers");
/**
 * auth middleware for all api routes
 * - authorization
 * - authentication
 * @param request
 * @param response
 * @param next
 * @returns
 */
const authorization = async (request, response, next) => {
    const bearerHeader = request.headers.authorization;
    /**
     * ddn't provide a key/token
     */
    if (!bearerHeader) {
        return response.status(400).send({
            status: 400,
            message: 'Bad Request',
        });
    }
    else {
        const bearerToken = bearerHeader.split(' ')[1];
        console.log({ bearerToken });
        /// passed an empty token
        if (!bearerToken)
            return response.status(400).send({
                status: 400,
                message: 'Bad Request',
            });
        /**
         * If the token is valid
         */
        if (await (0, helpers_1.isAuth)(bearerToken)) {
            next();
        }
        else {
            /**
             * else go through 401
             */
            response.status(401).send({
                status: 401,
                message: 'Unauthorized',
            });
        }
    }
};
exports.authorization = authorization;
//# sourceMappingURL=authorization.js.map