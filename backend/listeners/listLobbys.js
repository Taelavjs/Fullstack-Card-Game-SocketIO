const { getRoomStore } = require('../utility/roomStore');

const listLobbys = (socket) => {
    socket.on("listLobbys", (callback) => {
        const roomStore = getRoomStore();
        let roomsToClient = [];

        roomStore?.forEach((roomInfo) => {
            console.log(roomInfo.players.entries().next().value);
        
            const roomToClient = {
                roomTitle : roomInfo.room,
                hostName : roomInfo.players.entries().next().value.username,
                numPlayers : 1,
            }

            roomsToClient.push(roomToClient);
        })
        console.log(roomsToClient);
        callback({
            roomsToClient
        });
    })
}

module.exports = {
    listLobbys
}
