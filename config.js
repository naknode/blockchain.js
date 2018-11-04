/**
 * Options for the HTTP server
 */
module.exports = {
  peers: process.env.PEERS ? process.env.PEERS.split(',') : [],
  port: {
    http: process.env.HTTP_PORT || 3001,
    peer: process.env.PEER_PORT || 6001,
  }
};
