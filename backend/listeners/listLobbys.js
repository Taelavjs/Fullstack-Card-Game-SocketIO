const { getRoomStore } = require('../utility/roomStore');

const listLobbys = (socket) => {
    socket.on("listLobbys", (callback) => {
        const roomStore = getRoomStore();
        let roomsToClient = [];

        roomStore?.forEach((roomInfo) => {
            if(roomInfo.players.size == roomInfo.maxPlayerCount) return;
            const roomToClient = {
                roomTitle : roomInfo.room,
                hostName : roomInfo.host.username,
                numPlayers : roomInfo.players.size,
                maxNumPlayers : roomInfo.maxPlayerCount,
            }
            
            roomsToClient.push(roomToClient);
        })
        callback({
            roomsToClient
        });
    })
}

module.exports = {
    listLobbys
}
