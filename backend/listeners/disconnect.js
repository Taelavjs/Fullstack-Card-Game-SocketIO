const sessionHolder = require('../gameClasses/handlers/setupSessionStore.js');
const { session } = require('./session.js');
const timers = new Map(); // Store timers by session ID

const disconnect = (socket, io) => {
    const TimeOutRoomTime = 3;

    socket.on("disconnect", (reason) => {
        let sessionID = socket.handshake.auth.sessionID.toString();
        console.log(`disconnect ${socket.id} due to ${reason}`);
        let activeRoom = sessionHolder.getPreviousPlayerRooms(sessionID, socket.id);
        if(activeRoom == null) return;

        seshStore = sessionHolder.getSessionStore();
        discSession = seshStore.get(sessionID);

        discSession.setTimeoutFn(activeRoom, sessionID);

    //     const timer = setTimeout(() => {
    //         let playerGame = require('../utility/roomStore.js').getActiveRoom(activeRoom);
    //         require('../utility/roomStore.js').removeActiveRoom(activeRoom);
    //         sessionHolder.removePlayersActiveRoom(sessionID);
    //         console.log(`User ${socket.id} timed out after disconnect ${TimeOutRoomTime}`);
    //         if (!playerGame.removePlayer(sessionID)) return;
    //         console.log("host has left");
    //         require('../utility/roomStore.js').removeActiveRoom(activeRoom);
    //         playerGame.roomShutDown(sessionID);                        
    //         timers.delete(sessionID);
    //     }, TimeOutRoomTime * 1000); // 15 seconds

    //     timers.set(sessionID, timer);
    //     console.log(`timer for ${sessionID} has been started`)
    // });
})}

const clearDisconnectTimer = (sessionID) => {
    if (timers.has(sessionID)) {
        clearTimeout(timers.get(sessionID));
        timers.delete(sessionID);
        console.log(`Cleared disconnect timer for sessionID ${sessionID}`);
    }
};

module.exports = {
    disconnect,
    clearDisconnectTimer
};
