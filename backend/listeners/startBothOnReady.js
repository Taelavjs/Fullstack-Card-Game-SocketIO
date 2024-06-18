const { getRoomStore } = require('../utility/roomStore');
const startBothOnReady = (socket, playerObject, room) => {
    socket.once("ready", () => {
        const roomStore = getRoomStore();
        const match = roomStore.get(room);
        console.log("BBBBBBBBBBBB");
        console.log(playerObject);
        console.log(playerObject.socketID);
        console.log("BBBBBBBBBBBB");
        console.log(match.players);
        match.players.get(playerObject.socketID).setReadyStatus(true);
        console.log("readied ", playerObject);
        
        if (match.isAllReady()) {
            match.startMatch();
            console.log("match started yaya");
        }
    });
};

module.exports = {
    startBothOnReady,
}