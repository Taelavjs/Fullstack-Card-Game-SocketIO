const { getRoomStore } = require('../utility/roomStore');

const listLobbys = (socket) => {
    socket.on("listLobbys", (callback) => {
        const roomStore = getRoomStore();
        let roomsToClient = [];

        roomStore?.forEach((roomInfo) => {
            console.log(roomInfo.players);
            console.log("//////////////////")
            console.log("//////////////////")
            console.log("//////////////////")
            console.log("//////////////////")
        
            const roomToClient = {
                roomTitle : roomInfo.room,
                hostName : roomInfo.host.username,
                numPlayers : roomInfo.players.size,
                maxNumPlayers : roomInfo.maxPlayerCount,
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
