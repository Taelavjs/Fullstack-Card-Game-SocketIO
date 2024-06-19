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
        let sessionID = socket.handshake.auth.sessionID.toString();
        activeRoom = sessionHolder.getPreviousPlayerRooms(
          sessionID,
          socket.id,
        );

        if (activeRoom == null) {
          console.log("no rooms ");
        } else {
          socket.join(activeRoom);
          console.log("socket has rejoined ", activeRoom);

          let playerGame = require('./utility/roomStore.js').getActiveRoom(activeRoom);
          let playersUsernames = [];
          for(const [key, value] of playerGame.players.entries()){
            if(key == sessionID){
              value.newSocketID(socket.id);
              startBothOnReady(socket, value, activeRoom);
            }
            playersUsernames.push(value.username);

          }

          playerGame.updateSettings(socket);
          socket.emit("reconnected-room", {
            roomName: activeRoom,
            startStatus: playerGame.state,
            players : playersUsernames,
            isHost : sessionID == playerGame.host.sessionID,
          })



          if (playerGame.state == "PLAYING") {
            console.log(socket.username);
            for(const [key, value] of playerGame.players){
              if (sessionID == key){
                socket.emit("game-start");
                value.sendDeck();
                console.log("deckSending");
                playerGame.turns();
              }
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
