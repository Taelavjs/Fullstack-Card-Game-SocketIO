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

                match.opponent = new Player(socket.id, socket.username, "opponent", socket.handshake.auth.sessionID.toString());
                console.log("3")

                console.log(match);
                let hostUsn = match.host.username;
                let opponentUsn = match.opponent.username;
                io.in(room).emit("player-joined", { hostUsn, opponentUsn });

                cb({ hostUsn, opponentUsn });

                startBothOnReady(socket, "opponent", room);
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
