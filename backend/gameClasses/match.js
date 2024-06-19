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
    }

    updateSettings (socket) {


    }

    canPlayerJoin () {
        if (this.state !== "LOBBY") return false;
        return this.maxPlayerCount > this.players.size;
    }

    checkMinNumToStart () {
        console.log()
        return this.minNumPlayers > this.players.size;
    }

    newPlayerJoined(newPlayer) {
        this.players.set(newPlayer.sessionID, newPlayer);
    }

    isAllReady() {
        console.log("this.players:", this.players);

        for (const [key, value] of this.players.entries()) {
            console.log("KEY FOR FOR EACH", key);
            console.log(value)
            if (value.getReadyStatus()) continue;
            return false;
        }
        return true;
    }

    startMatch() {
        if (this.isAllReady()) {
            this.io.in(this.room).emit("game-start");
            console.log(`Both players in room ${this.room} are ready!`);
            this.createDeck();
            this.shuffleDeck();
            this.setAllPlayersDeck();
            this.state = 'PLAYING';
            this.handOutDecks();
        }
    }

    setAllPlayersDeck() {
        for (const [key, value] of this.players.entries()) {
            value.setDeck(this.createPlayerHands(2))
        }
    }



    handOutDecks() {
        for (const [key, value] of this.players.entries()) {
            value.gameStart();
        }
        this.timerStart(20);
        this.turns();
    }

    noCardsRemainingCheck() {
        console.log("checking 1223 123");
        console.log(this.players.values());
        for (const [key, value] of this.players.entries()) {
            if (value.noCardsRemaining) return true;
        }
        return false;
    }

    turns = () => {
        if (this.noCardsRemainingCheck()) {
            this.gameComplete();
            return;
        }
        this.timerRestart(20);
        console.log("TIMER STARTED AT 20");
        let promisesToRun = [];

        for (const [key, value] of this.players.entries()) {
            if (value.selectedCard == null) {
                promisesToRun.push(value.chosenCardListener());
            }
        }

        Promise.all(promisesToRun)
            .then(([card1, card2]) => {
                let cards = [];
                let highestCard = 0;
                let highestCardPlayer = "";
                for (const [key, value] of this.players.entries()) {
                    if (value.selectedCard == null) return;
                    cards.push(value.selectedCard);
                    console.log("cards : ", cards);
                    if (parseInt(value.selectedCard.value) > highestCard) {
                        highestCard = value.selectedCard.value;
                        highestCardPlayer = key;
                    }
                }
                for (const [key, value] of this.players.entries()) {
                    console.log(key, value, highestCard);
                    if (key == highestCardPlayer) {
                        // WINNER PLAYER
                        console.log("cards to add : ", cards);
                        value.addCardToDeck([...cards]);
                    }
                    value.resetChosenCard();
                }
                console.log(cards);
                this.recordRound(...cards);
                console.log(this.historyRound);
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
        var winner = "host";
        for (const [key, value] of this.players.entries()) {
            value.sendWinnerToPLayer(winner);
        }
        let roomStore = require('../utility/roomStore').removeActiveRoom(this.room);
        const sessionHandler = require("../gameClasses/handlers/setupSessionStore");

        for (const [key, value] of this.players.entries()) {
            sessionHandler.removePlayersActiveRoom(value.sessionID);
        }

        this.io.in(this.room).socketsLeave(this.room);
        console.log("Room ", this.room, " Shut ON Socket IO side");
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
