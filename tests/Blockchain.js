const test = require('ava');
const Blockchain = require('./../lib/Blockchain');
const Block = require('./../lib/Block');

test('genesis block is added', t => {
  const blockchain = new Blockchain();
  const genesisBlockchain = new Block(0, 1521157480924, '0', "GENESIS BLOCK", "8babe2452f152a6dc53a0034b5325537e6ee8ea4f8bb06baa8988007bee426dc", 0);

  t.deepEqual(blockchain.chain[0], genesisBlockchain);
});

test('block classes are valid', t => {
  const blockchain = new Blockchain();

  t.is(blockchain instanceof Blockchain, true);
  t.is(blockchain.chain[0] instanceof Block, true);
});

test('block structure is valid', t => {
  const blockchain = new Blockchain();
  const genesisBlock = blockchain.chain[0];

  t.is(typeof genesisBlock.index, 'number');
  t.is(typeof genesisBlock.hash, 'string');
  t.is(typeof genesisBlock.previousHash, 'string');
  t.is(typeof genesisBlock.timestamp, 'number');
  t.is(typeof genesisBlock.content, 'string');
  t.is(typeof genesisBlock.nonce, 'number');
});
