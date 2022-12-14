/**
 *
 */
const queue = require('queue')({results: [], autostart: true, timeout: 30000});

// get notified when jobs complete
queue.on('success', (result: any, job: {toString: () => string}) => {
  console.log(
    '\x1b[36m%s\x1b[0m',
    'job finished processing:',
    job.toString().replace(/\n/g, '')
  );
  console.log('\x1b[36m%s\x1b[0m', 'The queue done! result is:', result);
});

queue.on('timeout', (next: () => void, job: {toString: () => string}) => {
  console.log(
    '\x1b[36m%s\x1b[0m',
    'JOB TIMEOUT:',
    job.toString().replace(/\n/g, '')
  );
  next();
});
queue.on('error', (next: () => void, job: {toString: () => string}) => {
  console.log(
    '\x1b[31m%s\x1b[0m',
    'JOB TIMEOUT OR ERROR:',
    job.toString().replace(/\n/g, '')
  );
  next();
});

module.exports = queue;
