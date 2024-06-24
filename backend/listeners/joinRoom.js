const { getClientsInRoom } = require('../utility/utility');
const Player = require('../gameClasses/player');
const Match = require('../gameClasses/match');
const { getRoomStore, getActiveRoom } = require('../utility/roomStore');
const sessionHolder = require('../gameClasses/handlers/setupSessionStore');
const { startBothOnReady } = require('./startBothOnReady');

const joinRoom = (io, socket) => {
    socket.on("join-room", (room, cb) => {
        const match = getActiveRoom(room);
        if (match == undefined || !match.canPlayerJoin()) {
            cb(false);
            return;
        }
        try {
            console.log("PLAYER COUNT IN ", room, " IS ", getClientsInRoom(io, room));
            sessionHolder.setPlayersRoom(
                socket.handshake.auth.sessionID.toString(),
                room);
            console.log("PLAYER COUNT IN ", room, " IS ", getClientsInRoom(io, room));
            if (match == undefined || !match.canPlayerJoin()) {
                cb(false);
                return;
            }
            socket.join(room);

            let newPlayer = new Player(socket.id, socket.username, socket.handshake.auth.sessionID.toString());
            match.newPlayerJoined(newPlayer);

            let playerUsernames = [];
            match.players.forEach((value, key) => {
                playerUsernames.push(value.username);
                })
                

            io.in(room).emit("player-joined", playerUsernames );

            cb(playerUsernames);

            startBothOnReady(socket, newPlayer, room);
        } catch (err) {
            cb(false);
        }
    });
};

module.exports = {
    joinRoom,
};
