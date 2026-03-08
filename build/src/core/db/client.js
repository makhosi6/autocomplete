"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = client;
const node_config_1 = require("./../utils/node.config");
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
    client = redis.createClient(node_config_1.db_config);
    console.log('\x1b[31m%s\x1b[0m', 'Connecting to Redis server on');
    await client.connect();
    return client;
}
//# sourceMappingURL=client.js.map