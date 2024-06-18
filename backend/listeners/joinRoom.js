const { getClientsInRoom } = require('../utility/utility');
const Player = require('../gameClasses/player');
const Match = require('../gameClasses/match');
const { getRoomStore } = require('../utility/roomStore');
const sessionHolder = require('../gameClasses/handlers/setupSessionStore');
const { startBothOnReady } = require('./startBothOnReady');

const joinRoom = (io, socket) => {
    socket.on("join-room", (room, cb) => {
        console.log("join room try");
        const roomStore = getRoomStore();
        console.log("joining ", room, getClientsInRoom(io, room));
        console.log("1")
        if (getClientsInRoom(io, room) === 1) {
            try {
                socket.join(room);
                sessionHolder.setPlayersRoom(
                    socket.handshake.auth.sessionID.toString(),
                    room);
                if (getClientsInRoom(io, room) != 2) {
                    cb(false);
                    return;
                }


                const match = roomStore.get(room);
                console.log("5")

                let newPlayer = new Player(socket.id, socket.username, socket.handshake.auth.sessionID.toString());
                match.newPlayerJoined(newPlayer);

                let playerUsernames = [];
                for (const [key, value] of Object.entries(match.players)) {
                    console.log("BBBBBBBBBBBBBB")
                    console.log(key);
                    console.log("BBBBBBBBBBBBBB")
                    playerUsernames.push(value.username);
                  }
                io.in(room).emit("player-joined", { ...playerUsernames });

                cb({ ...playerUsernames });

                startBothOnReady(socket, newPlayer, room);
            } catch (err) {
                console.log(err);
                cb(false);
            }
        } else {
            cb(false);
        }
    });
};

module.exports = {
    joinRoom,
};
