const express = require('express');
const Redis = require('ioredis');

const app = express();
const redis = new Redis({
  port: 6379,
  host: '127.0.0.1',
  username: 'default',
  password: 'xy5rgQdRgu7NTtK',
  db: '0',
  no_ready_check: true,
  auth_pass: 'xy5rgQdRgu7NTtK',
});

app.use(express.json());

app.get('/autocomplete/:prefix', async (req, res) => {
  const {prefix} = req.params;
  const suggestions = await redis.zrangebylex(
    'autocomplete',
    `[${prefix}`,
    `[${prefix}\xff`
  );
  console.log({prefix, suggestions});
  res.json(suggestions);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
