// random.js
/**
 * 
 * @param {number} length 
 * @returns {number}
 */
const randomInt = (length) => {
    const num = Math.floor(Math.random() * length);
    return num;
};

const getClientsInRoom = (io, room) => {
    var usersinroom = 0;
    if (io.sockets.adapter.rooms.has(room)) usersinroom = io.sockets.adapter.rooms.get(room).size;
    return usersinroom;
}

const returnUsersWithReadyStatus = (listPlayers) => {
    let playerUsernames = [];
    listPlayers.forEach((value, key) => {
        playerUsernames.push({[value.username] : value.readyStatus});
    })

    return playerUsernames;
}



module.exports = {
    randomInt,
    getClientsInRoom,
};
