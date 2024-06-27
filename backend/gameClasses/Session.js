const discTimer = (callback) => {

}


class Session {
    /**
     * 
     * @param {number} userID 
     * @param {string} username 
     * @param {string} socketID 
     * @param {object} activeRoom 
     */
    constructor(userID, username, socketID, activeRoom = null){
        this.userID = userID;
        this.username = username;
        this.socketID = socketID;
        this.activeRoom = null;
        this.timeoutFn = null;
        
    }

    resetTimeoutFn(){
        if(this.timeoutFn){
            clearTimeout(this.timeoutFn);
            this.timeoutFn = null;
        }
    }

    setTimeoutFn(activeRoom, sessionID){
        const sessionHolder = require('./handlers/setupSessionStore.js');
        seshStore = sessionHolder.getSessionStore();
        console.log(seshStore.get(sessionID));
        discSession = seshStore.get(sessionID);
        if(this.timeoutFn) return;
        this.timeoutFn = setTimeout(() => {
            console.log("Disconnected FRFR");
            // Get game player is in, remove the game from lobby holder
            let playerGame = require('../utility/roomStore.js').getActiveRoom(activeRoom);
            sessionHolder.removePlayersActiveRoom(sessionID);

            if(playerGame.removePlayer(sessionID)) {
                console.log("host bye bye")
                discSession = seshStore.get(sessionID);
            }

        }, 1000);
    }
}

module.exports = Session;