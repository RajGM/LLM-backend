// worker.js

const args = process.argv.slice(2); // Get the arguments passed to this file

console.log(`Worker script started with args: ${args}`);

// Simulate some work with the arguments
setTimeout(() => {
  console.log(`Worker done processing: ${args}`);
}, 2000);
