const { session } = require("../../listeners/session");
const Session =require("../Session");
let sessionStore;

module.exports = {
    init: function () {
        sessionStore = new Map();
        sessionStore.set('1111',new Session(parseInt('0000'), 'dave', null, null));

        return sessionStore;
    },
    getSessionStore: function () {
        // return previously cached value
        if (!sessionStore) {
            throw new Error("must call .init() before you can call .getSessionStore()");
        }
        return sessionStore;
    },
    getPreviousPlayerRooms: (sessionID, socketID) => {
        sessionStore.get(sessionID).socketId = socketID;
        let record = sessionStore.get(sessionID);
        return record.activeRoom;
    },
    setPlayersRoom: (sessionID, room) => {
        sessionStore.get(sessionID).activeRoom = room;
    },

    removePlayersActiveRoom: (sessionID) => {
        console.log("removal van");
        console.log(sessionID);
        sessionStore.get(sessionID).activeRoom = null;
    },

    updatePlayersSocketID: (sessionID, newSocketID) => {
        sessionStore.get(sessionID).socketID = newSocketID;
    }
}
