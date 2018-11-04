class Block {
  constructor(index, timestamp, previousHash, content, hash, nonce) {
    // The unique ID of this block
    this.index = index;

    // The previous hash of last successful block
    this.previousHash = previousHash.toString();

    // When this block was created
    this.timestamp = timestamp;

    // What are we putting into the block?
    this.content = content;

    // The hash of this block
    this.hash = hash.toString();

    // An arbitrary number that can only be used once
    this.nonce = nonce;
  }
}

module.exports = Block;
