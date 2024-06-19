const {
    getClientsInRoom
} = require('../utility/utility');
const Player = require('../gameClasses/player');
const Match = require('../gameClasses/match');
const {
    getRoomStore,
    setRoomStore
} = require('../utility/roomStore');
const sessionHolder = require('../gameClasses/handlers/setupSessionStore');
const {
    startBothOnReady
} = require('./startBothOnReady');

const createRoom = (socket, io) => {
    socket.on("create-room", (room, cb) => {
        if (getClientsInRoom(io, room) >= 1) {
            console.log(room);
            cb(false);
            return;
        }
        socket.join(room);
        sessionHolder.setPlayersRoom(
            socket.handshake.auth.sessionID.toString(),
            room);
        
        const hostPlayer = new Player(socket.id, socket.username, socket.handshake.auth.sessionID.toString());
        const createdMatch = new Match(hostPlayer, null, room, 0, 0, "LOBBY", io);
        setRoomStore(room, createdMatch);
        cb([hostPlayer.username]);
        createdMatch.updateSettings(socket);

        startBothOnReady(socket, hostPlayer, room);
        
    });
};

module.exports = {
    createRoom,
};