const Player = require('./player');
const Card = require('./../gameClasses/card');
const { session } = require('../listeners/session');

class Match {
    /**
     * 
     * @param {Player} host 
     * @param {*} opponent 
     * @param {string} room 
     * @param {int} round 
     * @param {int} timer 
     * @param {string} state 
     * @param {*} io 
     * @param {int} minNumPlayers
     */
    constructor(host, opponent = null, room, round = 0, timer = 0, state = "LOBBY", io, minNumPlayers = 2, maxPlayerCount = 3) {
        this.score = 0;
        this.players = new Map();
        this.players.set(host.sessionID, host);
        this.host = host;
        this.roundNumber = round;
        this.timer = timer;
        this.state = state;
        this.room = room;
        this.matchDeck = [];
        this.io = io;
        this.historyRound = [];
        this.minNumPlayers = minNumPlayers;
        this.maxPlayerCount = maxPlayerCount;
        this.winner = null;
        this.settingsSocket = null;
    }

    addNewPlayer () {

    }

    removePlayer(sessionID) {
        const leftUsn = this.players.get(sessionID).username;
        this.players.delete(sessionID);

        if (sessionID === this.host.sessionID && this.status != "PLAYING") {
            for(const [key, value] in this.players){
                value.removeListeners();
            }
            // Host is leaving, shut down the room
            this.roomShutDown();
            return true;
        } else {
            // Notify remaining players that a player has left
            this.playerLeft(leftUsn);
            if(this.state == "PLAYING") this.turns();
            return false;
        }
    }

    updateSettings(socket) {
        this.settingsSocket = socket;
        if (parseInt(socket.handshake.auth.sessionID) !== parseInt(this.host.sessionID)) return;
    
        socket.on("match-settings", ({ maxPlayers, minPlayers }, cb) => {
            if (!(maxPlayers <= 15 && minPlayers <= 15 && 
                maxPlayers >= 2 && minPlayers >= 2 && 
                maxPlayers >= minPlayers && 
                maxPlayers >= this.players.size)) {
                cb(false);
                return; 
            }
            this.maxPlayerCount = maxPlayers;
            this.minNumPlayers = minPlayers;
            cb(true);
    
            // Emit the updated settings after they have been changed
            this.emitMatchSettings();
        });
    }

    canPlayerJoin () {
        if (this.state !== "LOBBY") return false;
        return this.maxPlayerCount > this.players.size;
    }

    checkMinNumToStart () {
        return this.minNumPlayers > this.players.size;
    }

    emitMatchSettings(){

        let io = require('../socket').getio();

        io.to(this.room).emit("settings_details", (
            {
                maxPlayers : this.maxPlayerCount, 
                minPlayers : this.minNumPlayers,
                timer : this.timer
            }))
    }

    newPlayerJoined(newPlayer) {
        this.players.set(newPlayer.sessionID, newPlayer);
        this.emitMatchSettings();
        return this.emitPlayersInRoom();
    }

    emitPlayersInRoom(){
        let io = require('../socket').getio();

        let playerUsernames = [];
        this.players.forEach((value, key) => {
            playerUsernames.push(value.username);
            value.resetReadyStatus();
            })
            
        console.log("PLayer names : ", playerUsernames);
        io.in(this.room).emit("player-joined", playerUsernames );
        return playerUsernames;
    }

    isAllReady() {
        for (const [key, value] of this.players.entries()) {
            if (value.getReadyStatus()) continue;
            return false;
        }
        return true;
    }

    startMatch() {
        if (this.isAllReady()) {
            this.io.in(this.room).emit("game-start", (cb) => {
                if(cb){
                    console.log(`Both players in room ${this.room} are ready!`);
                    this.createDeck();
                    this.shuffleDeck();
                    this.setAllPlayersDeck();
                    this.state = 'PLAYING';
                    this.handOutDecks();
                }
            });

        }
    }

    setAllPlayersDeck() {
        for (const [key, value] of this.players.entries()) {
            value.setDeck(this.createPlayerHands(2))
        }
    }



    handOutDecks() {
        for (const [key, player] of this.players.entries()) {
            player.sendDeck();
        }
        this.timerStart(20);
        this.turns();
    }

    noCardsRemainingCheck() {
        let keysNoRemainingCards = [];

        for (const [key, value] of this.players.entries()) {
            if (value.noCardsRemaining && value.selectedCard === null) keysNoRemainingCards.push(key);
        }
        return keysNoRemainingCards;
    }

    turns = () => {

        let playersWithNoCards = this.noCardsRemainingCheck();
        console.log(playersWithNoCards);
        if (playersWithNoCards.length == this.players.size - 1) {
            this.gameComplete();
            return;
        }
        this.timerRestart(20);
        let promisesToRun = [];

        for (const [key, value] of this.players.entries()) {
            if (value.selectedCard == null && !playersWithNoCards.includes(key)) {
                promisesToRun.push(value.chosenCardListener());
            }
        }

        Promise.all(promisesToRun)
            .then(([card1, card2]) => {
                let cards = [];
                let highestCard = 0;
                let highestCardPlayer = "";
                for (const [key, value] of this.players.entries()) {

                    if( playersWithNoCards.includes(key)) continue;
                    if (value.selectedCard == null) return;
                    cards.push(value.selectedCard);
                    if (parseInt(value.selectedCard.value) > highestCard) {
                        highestCard = value.selectedCard.value;
                        highestCardPlayer = key;
                    }
                }
                for (const [key, value] of this.players.entries()) {
                    if(playersWithNoCards.includes(key)) continue;
                    value.removeCard();

                    if (key == highestCardPlayer) {
                        // WINNER PLAYER
                        value.addCardToDeck([...cards]);
                    }
                    value.resetChosenCard();
                    value.sendDeck();
                }
                this.recordRound(...cards);
                this.turns();
            })
            .catch(error => {
                // Runs repeatedly if user disconnects prior to receiving a request
                // Emitted within the processes of turn()
                console.log("Macchy err", error);
            });

    }

    recordRound = (cards) => {
        this.historyRound.push({
            roomName: this.room,
            roundNumber: this.roundNumber++,
            cardsSelected: cards,
        });
    }

    createDeck() {
        const suits = ["spades", "diamonds", "clubs", "hearts"];
        const values = ["14", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"];
        this.matchDeck = [];

        for (let i = 0; i < suits.length; i++) {
            for (let x = 0; x < values.length; x++) {
                let card = new Card(values[x], suits[i], Math.floor(100000 + Math.random() * 900000));
                this.matchDeck.push(card);
            }
        }
    }

    shuffleDeck() {
        for (let i = this.matchDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.matchDeck[i], this.matchDeck[j]] = [this.matchDeck[j], this.matchDeck[i]];
        }
    }


    createPlayerHands(numCards = 2) {
        let handOfCards = [];
        for (let i = 0; i < numCards; i++) {
            handOfCards.push(this.matchDeck.pop());
        }
        return handOfCards;
    }

    playing() {
        if (this.state !== 'PLAYING') return;
        // Additional game logic can go here
    }

    timerStart = async (x) => {
        this.timer = x;
        while (this.timer > 0) {
            let result = await resolveAfter1Second();
            this.timer--;
        }
    }

    timerRestart = (x) => {
        this.timer = x;
    }

    gameComplete() {
        this.winner = "host";
        for (const [key, value] of this.players.entries()) {
            value.removeListeners();
            value.noCardsRemaining ? this.winner = this.winner : this.winner = value.username;
        }

        let roomStore = require('../utility/roomStore').removeActiveRoom(this.room);
        const sessionHandler = require("../gameClasses/handlers/setupSessionStore");

        for (const [key, value] of this.players.entries()) {
            value.sendWinnerToPLayer(this.winner);
            value.removeListeners();
            sessionHandler.removePlayersActiveRoom(value.sessionID);
        }

        this.io.in(this.room).socketsLeave(this.room);
    }

    roomShutDown() {

        let io = require('../socket').getio();
        io.in(this.room).emit("room-shutdown");


        io.in(this.room).socketsLeave(this.room);

        // Perform additional cleanup if needed
        require('../utility/roomStore.js').removeActiveRoom(this.room);
        const sessionHolder = require('../gameClasses/handlers/setupSessionStore.js');

        for (const [key, value] of this.players.entries()) {
            value.removeListeners();
            sessionHolder.removePlayersActiveRoom(value.sessionID);
        }

        this.players.clear();
    }
    

    playerLeft(playerUsername){
        let io = require('../socket').getio();

        io.in(this.room).emit("player-left", playerUsername);
        this.emitPlayersInRoom();
        
    }
}
function resolveAfter1Second() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('resolved');
        }, 1000);
    });
}


module.exports = Match;
