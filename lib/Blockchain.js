const SHA256 = require('crypto-js/sha256');
const Block = require('./Block');

class Blockchain {
  constructor() {
    // Web class inheritance
    this.web = null;

    // The blockchain
    this.chain = [this.getGenesisBlock()];

    // Difficulty level
    this.difficulty = 2;
  }

  /**
   * Find a block in the chain
   *
   * @param {integer} index The index of the block
   * @param {timestamp} timestamp The date of the block object
   * @param {string} previousHash The previous SHA256 hash of the last block
   * @param {string} content The data to be inserted
   * @returns {Block}
   */
  findBlock(index, timestamp, previousHash, content) {
    // Times needed for computation to solve
    let nonce = 0;

    do {
      // Calculate hash
      const hash = Blockchain.calculateHash(index, timestamp, previousHash, content, nonce);

      // Perform computations until a hash is found
      if (this.solveAlgorithm(hash, this.difficulty)) {
        return new Block(index, timestamp, previousHash, content, hash, nonce);
      }
      nonce++;

    } while (true);
  }

  /**
   * Solve a problem
   *
   * @param {string} hash The SHA256 hash of the block
   * @param {integer} difficulty The level of difficulty of the algorithm
   * @returns {boolean}
   */
  solveAlgorithm(hash, difficulty) {
    const number = Math.floor((Math.random() + 1) * 999).toString();
    const solveFor = (5 + 72 * (difficulty)).toString();
    return number.includes(solveFor);
  }

  /**
   * The Genesis block of the blockchain
   *
   * @returns {Block}
   */
  getGenesisBlock() {
    const data = {
      index: 0,
      previousHash: '0',
      timestamp: 1521157480924,
      content: "GENESIS BLOCK",
      hash: "",
      nonce: 0
    };

    data.hash = Blockchain.calculateHash(data.index, data.timestamp, data.previousHash, data.content, data.nonce);

    console.log('Genesis block has been added.');

    return new Block(data.index, data.timestamp, data.previousHash, data.content, data.hash, data.nonce);
  }

  /**
   * Add a block to the chain
   *
   * @param {Block} newBlock The block being added
   */
  add(newBlock) {
    if (this.validate(this.latestBlock(), newBlock)) {
      this.chain.push(newBlock);
    }
  }

  /**
   * Validates the integerity of two blocks
   *
   * @param {Block} previousBlock The previous block in the chain
   * @param {Blcok} newBlock The new block just created
   * @returns {boolean}
   */
  validate(previousBlock, newBlock) {
    if (previousBlock.hash !== newBlock.previousHash) {
      console.log('Hash not valid.');
      return false;
    } else if (previousBlock.index + 1 !== newBlock.index) {
      console.log('Block index not valid.');
      return false;
    } else if (Blockchain.calculateHash(previousBlock.index, previousBlock.timestamp, previousBlock.previousHash, previousBlock.content, previousBlock.nonce) !== newBlock.previousHash) {
      console.log('Blockchain integrity not valid.');
      return false;
    }

    return true;
  }

  /**
   * What to do when peer receives a new block
   *
   * @param {object} message The blockchain being handled
   */
  handleResponse(message) {
    const receivedBlocks = message.data.sort((b1, b2) => b1.index - b2.index);
    const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    const latestBlock = this.latestBlock();

    if (latestBlockReceived.index > latestBlock.index) {
      if (latestBlock.hash === latestBlockReceived.previousHash) {
        this.chain.push(new Block(latestBlockReceived.index, latestBlockReceived.timestamp, latestBlockReceived.previousHash, latestBlockReceived.content, latestBlockReceived.hash, latestBlockReceived.nonce));
        console.log(this.chain);
        this.web.broadcast(this.web.wholeBlockchain());
      } else if (this.chain.length === 1) {
        this.chain = message.data.map(block => {
          return new Block(block.index, block.timestamp, block.previousHash, block.content, block.hash, block.nonce);
        });

        console.log(this.chain);
      }
    } else {
      console.log(this.chain);
    }
  }

  /**
   * Generates the SHA256 hash for the block
   *
   * @param {index} index The index of the Blockchain
   * @param {timestamp} timestamp The date the block was created
   * @param {SHA256} previousHash The previous hash of the block
   * @param {string} content The content of the block
   * @param {integer} nonce Computations solved to get hash
   * @returns {SHA256}
   */
  static calculateHash(index, timestamp, previousHash, content, nonce) {
    return SHA256(index + timestamp + previousHash + content + nonce).toString();
  }

  /**
   * A new block is requested to be mined
   *
   * @param {string} content The content being mined
   * @returns {object}
   */
  mine(content) {
    return {
      previousBlock: this.latestBlock(),
      index: this.latestBlock().index + 1,
      timestamp: new Date().getTime(),
      previousHash: this.latestBlock().hash,
      content
    };
  }

  /**
   * Returns the latest block in the chain
   *
   * @returns {Block}
   */
  latestBlock() {
    return this.chain[this.chain.length - 1];
  }
}

module.exports = Blockchain;
