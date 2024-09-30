// master.js

const { spawn } = require('child_process');

// List of arguments to pass to worker.js
const argumentsList = [
  ['arg1', 'arg2'],
  ['arg3', 'arg4'],
  ['arg5', 'arg6']
];

argumentsList.forEach(args => {
  const worker = spawn('node', ['worker.js', ...args]);

  // Handle output from the worker.js process
  worker.stdout.on('data', (data) => {
    console.log(`Output from worker with args [${args.join(', ')}]: ${data}`);
  });

  // Handle any errors
  worker.stderr.on('data', (data) => {
    console.error(`Error from worker with args [${args.join(', ')}]: ${data}`);
  });

  // Handle exit of worker process
  worker.on('exit', (code) => {
    console.log(`Worker with args [${args.join(', ')}] exited with code ${code}`);
  });
});
