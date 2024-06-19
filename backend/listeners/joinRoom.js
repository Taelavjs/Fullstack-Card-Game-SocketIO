const { getClientsInRoom } = require('../utility/utility');
const Player = require('../gameClasses/player');
const Match = require('../gameClasses/match');
const { getRoomStore, getActiveRoom } = require('../utility/roomStore');
const sessionHolder = require('../gameClasses/handlers/setupSessionStore');
const { startBothOnReady } = require('./startBothOnReady');

const joinRoom = (io, socket) => {
    socket.on("join-room", (room, cb) => {
        const match = getActiveRoom(room);
        if (!match.canPlayerJoin()) {
            console.log(getClientsInRoom(io, room), " was nun");
            cb(false);
        }

        try {
            console.log("PLAYER COUNT IN ", room, " IS ", getClientsInRoom(io, room));

            sessionHolder.setPlayersRoom(
                socket.handshake.auth.sessionID.toString(),
                room);
            console.log("PLAYER COUNT IN ", room, " IS ", getClientsInRoom(io, room));
            if (!match.canPlayerJoin()) {
                cb(false);
                console.log("RETURNED FALSEY");
                return;
            }

            console.log("RETURNED FALSEY");

            console.log("5")
            socket.join(room);

            let newPlayer = new Player(socket.id, socket.username, socket.handshake.auth.sessionID.toString());
            match.newPlayerJoined(newPlayer);

            let playerUsernames = [];
            console.log(match.players);
            match.players.forEach((value, key) => {
                console.log("BBBBBBBBBBBBBB")
                console.log(key);
                console.log("BBBBBBBBBBBBBB")
                playerUsernames.push(value.username);
                })
                

            io.in(room).emit("player-joined", playerUsernames );
            console.log(playerUsernames);

            cb(playerUsernames);

            startBothOnReady(socket, newPlayer, room);
        } catch (err) {
            console.log("RETURNED ERR");

            console.log(err);
            cb(false);
        }
    });
};

module.exports = {
    joinRoom,
};
