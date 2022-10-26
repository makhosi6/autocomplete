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
exports.client = void 0;
const db_config_1 = require("./../utils/db.config");
/**
 *
 * @returns redis client
 */
function client() {
    return __awaiter(this, void 0, void 0, function* () {
        const redis = require('redis'), 
        /**
         * @example db_config = {
         * url: '',
         * username: '',
         * password: '',
         * database: '',
         * no_ready_check: true,
         * auth_pass: '',
        };
         */
        client = redis.createClient(db_config_1.db_config);
        console.log('\x1b[31m%s\x1b[0m', 'Connecting to Redis server on');
        yield client.connect();
        return client;
    });
}
exports.client = client;
