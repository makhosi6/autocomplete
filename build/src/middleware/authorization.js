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
const authorization = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    const bearerHeader = request.headers.authorization;
    /**
     * ddn't provide a key/token
     */
    if (!bearerHeader) {
        return response.sendStatus(400);
    }
    else {
        const bearerToken = bearerHeader.split(' ')[1];
        console.log({ bearerToken });
        /// passed an empty token
        if (!bearerToken)
            return response.sendStatus(400);
        /**
         * If the token is valid
         */
        if (yield (0, helpers_1.isAuth)(bearerToken))
            next();
        /**
         * else go through
         */ else
            response.sendStatus(401);
    }
});
exports.authorization = authorization;
