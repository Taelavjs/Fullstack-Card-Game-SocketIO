const { getRoomStore } = require('../utility/roomStore');
const startBothOnReady = (socket, playerPos, room) => {
    socket.once("ready", () => {
        const roomStore = getRoomStore();
        const match = roomStore.get(room);
        if (playerPos == "host") {
            match.host.setReadyStatus(true);
        } else {
            match.opponent.setReadyStatus(true);
        }
        console.log("readied ", playerPos);

        if (match.host.getReadyStatus() && match.opponent && match.opponent.getReadyStatus()) {
            match.startMatch();
            console.log("match started yaya");
        }
    });
};

module.exports = {
    startBothOnReady,
}