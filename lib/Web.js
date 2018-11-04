// Peer to peer communication library
const WebSocket = require("ws");

// Configuration object
const config = require("./../config");

// Define server constants
const Hapi = require('hapi');
const server = Hapi.server({
  port: config.port.http,
  host: 'localhost'
});

class Web {
  constructor(blockchain) {
    // List of peers to connect to intially
    this.peers = config.peers;

    // List of connected peers on the distributed network
    this.sockets = [];

    // The Blockchain inheritance object
    this.blockchain = blockchain;
  }

  /**
   * Start the HTTP server
   */
  async serverStart() {
    await server.start();
    console.log(`HTTP server listening on port ${server.info.port}`);
  }

  /**
   * Start the HapiJS server
   */
  start() {
    server.route({
      method: 'POST',
      path: '/mine',
      handler: (req) => {
        // What will our block say?
        const content = req.payload.content;

        // Construct the block object structure
        const newBlock = this.blockchain.mine(content);

        // Try to mine and find a block
        const foundBlock = this.blockchain.findBlock(newBlock.index, newBlock.timestamp, newBlock.previousHash, newBlock.content);

        // Block found, add it to the chain.
        this.blockchain.add(foundBlock);

        // Tell the other users in the network of the new chain
        this.broadcast(this.wholeBlockchain());

        return 'Block successfully mined.';
      }
    });

    // Server for incoming POSTs
    this.serverStart();

    // Connect to your own WebSocket server
    this.peerServer();

    // Connect to other peers
    this.connectWithPeers(config.peers);
  }

  /**
   * Connect to other peers via their WebSocket port
   *
   * @param {array} peers A list of ports of WebSocket peers
   */
  connectWithPeers(peers) {
    peers.forEach(peer => {
      const ws = new WebSocket(`ws://localhost:${peer}`);
      ws.on('open', () => this.handleConnection(ws));
    });
  }

  /**
   * Open up your WebSocket server to listen for incoming messages
   */
  peerServer() {
    const server = new WebSocket.Server({ port: config.port.peer });
    console.log('Peer server listening on port', config.port.peer);
    server.on('connection', ws => this.handleConnection(ws));
  }

  /**
   * Handle incoming WebSocket peer connections and assign them appropriate event handlers
   *
   * @param {WebSocket} ws The incoming peer connection
   */
  handleConnection(ws) {
    this.sockets.push(ws);
    this.socketHandler(ws);
    this.errorHandler(ws);
    this.write(ws, this.queryBlockchain());
  }

  /**
   * Query the latest blockchain compared to yours
   *
   * @param {object} blockchain The blockchain we currently have
   */
  queryBlockchain(blockchain) {
    return {
      type: 'latest',
      data: blockchain
    };
  }

  /**
   * Handle approriately when a peer falls into danger
   *
   * @param {WebSocket} ws The peer connection
   */
  errorHandler(ws) {
    ws.on('close', () => this.disconnectClient(ws));
    ws.on('error', () => this.disconnectClient(ws));
  }

  /**
   * When a user leaves, remove them from your peers list.
   *
   * @param {WebSocket} ws The peer that is disconnecting
   */
  disconnectClient(ws) {
    console.log('A peer disconnected.');
    this.sockets.splice(this.sockets.indexOf(ws), 1);
  }

  /**
   * Handle the message incoming from a peer appropriately
   *
   * @param {WebSocket} ws The peer sending a message
   */
  socketHandler(ws) {
    ws.on('message', (data) => {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'latest':
          this.write(ws, this.wholeBlockchain());
          break;
        case 'blockchain':
          this.blockchain.handleResponse(message);
          break;
      }
    });
  }

  /**
   * Get the latests block in your blockchain
   *
   * @returns {object}
   */
  queryBlock() {
    return {
      type: 'blockchain',
      data: [this.blockchain.latestBlock()]
    }
  }

  /**
   * Gets the whole blockchain in your blockchain
   *
   * @returns {object}
   */
  wholeBlockchain() {
    return {
      type: 'blockchain',
      data: this.blockchain.chain
    };
  }

  /**
   * Send a client a message via WebSocket
   *
   * @param {WebSocket} ws The peer having the message sent to
   * @param {string} message The message being sent
   */
  write(ws, message) {
    ws.send(JSON.stringify(message));
  }

  /**
   * Send a message to all connected clients
   *
   * @param {string} data The message being sent
   */
  broadcast(data) {
    this.sockets.forEach(socket => this.write(socket, data));
  }
}

module.exports = Web;
