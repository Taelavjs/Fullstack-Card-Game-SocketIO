const { getRoomStore } = require('../utility/roomStore');

const listLobbys = (socket) => {
    socket.on("listLobbys", (callback) => {
        const roomStore = getRoomStore();
        let roomsToClient = [];

        roomStore?.forEach((roomInfo) => {
            const roomToClient = {
                roomTitle : roomInfo.room,
                hostName : roomInfo.host.username,
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
