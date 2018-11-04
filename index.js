const Web = require('./lib/Web');
const Blockchain = require('./lib/Blockchain');

/**
 * Start the blockchain
 */
const blockchain = new Blockchain();
const web = new Web(blockchain);

// Start the web server
web.start();

// Assign web object to the Blockchain
blockchain.web = web;
