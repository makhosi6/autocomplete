"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const db_config_1 = require("./../utils/db.config");
/**
 *
 * @returns redis client
 */
async function client() {
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
    await client.connect();
    return client;
}
exports.client = client;
//# sourceMappingURL=client.js.map