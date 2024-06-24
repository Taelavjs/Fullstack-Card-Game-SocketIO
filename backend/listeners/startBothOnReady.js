const { getRoomStore } = require('../utility/roomStore');
const startBothOnReady = (socket, playerObject, room) => {
    socket.on("ready", () => {
        const roomStore = getRoomStore();
        const match = roomStore.get(room);
        console.log(match.players);
        if(match.checkMinNumToStart()) {
            return;
        }
        match.players.get(playerObject.sessionID).setReadyStatus(true);
        if (match.isAllReady()) {
            match.startMatch();
        }
    });
};

module.exports = {
    startBothOnReady,
}