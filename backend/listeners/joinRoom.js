const { getClientsInRoom } = require('../utility/utility');
const Player = require('../gameClasses/player');
const Match = require('../gameClasses/match');
const { getRoomStore, getActiveRoom } = require('../utility/roomStore');
const sessionHolder = require('../gameClasses/handlers/setupSessionStore');
const { startBothOnReady } = require('./startBothOnReady');

const joinRoom = (io, socket) => {
    socket.on("join-room", (room, cb) => {
        console.log("attempted join");
        const match = getActiveRoom(room);
        if (match == undefined || !match.canPlayerJoin()) {
            console.log(match.canPlayerJoin());
            console.log(match);

            console.log("first if");
            cb(false);
            return;
        }
        try {
            console.log("PLAYER COUNT IN ", room, " IS ", getClientsInRoom(io, room));

            console.log("PLAYER COUNT IN ", room, " IS ", getClientsInRoom(io, room));
            if (match == undefined || !match.canPlayerJoin()) {
            console.log("2nd if");

                cb(false);
                return;
            }
            sessionHolder.setPlayersRoom(
                socket.handshake.auth.sessionID.toString(),
                room);
            socket.join(room);
            console.log(room, "room");
            let newPlayer = new Player(socket.id, socket.username, socket.handshake.auth.sessionID.toString());
            console.log(match.newPlayerJoined(newPlayer));

            let playerUsernames = [];
            match.players.forEach((value, key) => {
                playerUsernames.push(value.username);
                value.resetReadyStatus();
                })
                
                console.log("emit player joined");
            io.in(room).emit("player-joined", playerUsernames );
            
            cb(playerUsernames);

            startBothOnReady(socket, newPlayer, room);
        } catch (err) {
            console.log(err);
            cb(false);
        }
    });
};

module.exports = {
    joinRoom,
};
