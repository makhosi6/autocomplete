import {db_config} from './../utils/node.config';
/**
 *
 * @returns redis client
 */
export async function client() {
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
    client = redis.createClient(db_config);
  console.log('\x1b[31m%s\x1b[0m', 'Connecting to Redis server on');

  await client.connect();

  return client;
}
