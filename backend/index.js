const express = require('express');
const {
  createServer
} = require('http');
const {
  fileURLToPath
} = require('url');
const {
  dirname,
  join
} = require('path');
const {
  randomInt,
  getClientsInRoom
} = require('./utility/utility.js');
const {
  disconnect
} = require('./listeners/disconnect.js');
const {
  session
} = require('./listeners/session.js');
const {
  createRoom
} = require('./listeners/createRoom.js');
const {
  joinRoom
} = require('./listeners/joinRoom.js');
const {
  listLobbys
} = require('./listeners/listLobbys.js');
const {
  onConnection
} = require('./listeners/onConnection.js');

const {
  startBothOnReady
} = require("./listeners/startBothOnReady.js");
const sessionHolder = require('./gameClasses/handlers/setupSessionStore.js');
let roomStore = require('./utility/roomStore.js').init();


const Player = require('./gameClasses/player.js');
const Match = require('./gameClasses/match.js');
const player = require('./gameClasses/player.js');

const app = express();
const server = require('https').createServer(app);
let io;
let middleware;
(async () => {
  try {
    io = await require('./socket.js').init(server);
    middleware = require('./middleware/connectionMiddleware.js');

    let sessionStore = sessionHolder.init();

    middleware(sessionStore);

    io.on("connection", (socket) => {

      if (onConnection(sessionStore, socket)) {
        //RECONNECTED WITH SESSION ID
        console.log("welcome back!");
        activeRoom = sessionHolder.getPreviousPlayerRooms(
          socket.handshake.auth.sessionID.toString(),
          socket.id,
        );

        if (activeRoom == null) {
          console.log("no rooms ");
        } else {
          socket.join(activeRoom);
          console.log("socket has rejoined ", activeRoom);
          let playerGame = require('./utility/roomStore.js').getActiveRoom(activeRoom);
          if (socket.username == playerGame.host.username) {
            playerGame.host.newSocketID(socket.id);
            startBothOnReady(socket, "host", activeRoom);
          } else {
            playerGame.opponent.newSocketID(socket.id);
            startBothOnReady(socket, "opponent", activeRoom);
          }

          socket.emit("reconnected-room", {
            roomName: activeRoom,
            startStatus: playerGame.state,
            host: playerGame.host.username,
            opponent: playerGame.opponent ? playerGame.opponent.username : null,
          })



          if (playerGame.state == "PLAYING") {
            console.log(socket.username);
            if (socket.username == playerGame.host.username) {
              socket.emit("game-start");
              playerGame.host.sendDeck();
              console.log("deckSending");
              playerGame.turns();

            } else {
              socket.emit("game-start");
              playerGame.opponent.sendDeck();
              playerGame.turns();
            }

          }
        }
      };
      // LISTENERS ======================
      console.log('listeners');
      session(socket);
      createRoom(socket, io, sessionStore);
      disconnect(socket, io);
      joinRoom(io, socket, sessionStore);
      listLobbys(socket);
      // LISTENERS ======================
    });

    io.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
    io.listen(3000);
  } catch (err) {
    console.log(err);
  }
})();
