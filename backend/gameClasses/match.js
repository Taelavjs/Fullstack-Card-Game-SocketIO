const Player = require('./player');
const Card = require('./../gameClasses/card');
const { session } = require('../listeners/session');

class Match {
    constructor(host, opponent = null, room, round = 0, timer = 0, state = "LOBBY", io) {
        this.score = 0;
        this.host = host;
        this.opponent = opponent;
        this.roundNumber = round;
        this.timer = timer;
        this.state = state;
        this.room = room;
        this.matchDeck = [];
        this.io = io;
        this.historyRound = [];
    }

    startMatch() {
        if (this.host.getReadyStatus() && this.opponent.getReadyStatus()) {
            this.io.in(this.room).emit("game-start");
            console.log(`Both players in room ${this.room} are ready!`);
            this.createDeck();
            this.shuffleDeck();
            this.host.setDeck(this.createPlayerHands(5));
            this.opponent.setDeck(this.createPlayerHands(5));
            this.state = 'PLAYING';
            this.handOutDecks();
        }
    }

    handOutDecks() {
        this.host.gameStart();
        this.opponent.gameStart();
        this.timerStart(20);
        this.turns();
    }
    turns = () => {
        if (this.opponent.noCardsRemaining ||
            this.host.noCardsRemaining) {

            this.gameComplete();
            return;
        }
        this.timerRestart(20);
        console.log("TIMER STARTED AT 20");
        console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
        console.log("hosts card : ", this.host.selectedCard);
        console.log("opponents card : ", this.opponent.selectedCard);
        let promisesToRun = [];
        if(this.opponent.selectedCard == null) {
            promisesToRun.push(this.opponent.chosenCardListener());
        }
        if(this.host.selectedCard == null){
            promisesToRun.push(this.host.chosenCardListener());
        }
        console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
        
        Promise.all(promisesToRun)
            .then(([card1, card2]) => {
                card1 = this.host.selectedCard;
                card2 = this.opponent.selectedCard;
                if (card1 == null || card2 == null){
                    return;
                }
                console.log(card1, card2);
                console.log("Match Both Cards Chosen");
                if (parseInt(card1.value) > parseInt(card2.value)) {
                    console.log("host wins");
                    this.host.addCardToDeck([card1, card2]);
                } else if (parseInt(card2.value) > parseInt(card1.value)) {
                    console.log("opponent wins");
                    this.opponent.addCardToDeck([card1, card2]);
                } else {
                    console.log("draw");
                    this.opponent.addCardToDeck([card2]);
                    this.host.addCardToDeck([card1]);
                }
                this.host.resetChosenCard();
                this.opponent.resetChosenCard();
                this.recordRound(card1, card2);
                console.log(this.historyRound);
                this.turns();

            })
            .catch(error => {
                // Runs repeatedly if user disconnects prior to receiving a request
                // Emitted within the processes of turn()
                console.log("Macchy err", error);
            });

    }

    recordRound = (hostSelectedCard, opponentSelectedCard) => {
        this.historyRound.push({
            roomName: this.room,
            roundNumber: this.roundNumber++,
            hostSelection: { playerID: this.host.socketID, card: hostSelectedCard },
            opponentSelection: { playerID: this.opponent.socketID, card: opponentSelectedCard }
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
        var winner;
        if (this.opponent.noCardsRemaining) {
            winner = "host";
        } else {
            winner = "opponent";
        }

        this.host.sendWinnerToPLayer(winner);
        this.opponent.sendWinnerToPLayer(winner);
        console.log(this.room, "will be deleted");
        let roomStore = require('../utility/roomStore').removeActiveRoom(this.room);
        const sessionHandler = require("../gameClasses/handlers/setupSessionStore");
        sessionHandler.removePlayersActiveRoom(this.host.sessionID);
        sessionHandler.removePlayersActiveRoom(this.opponent.sessionID);

        console.log(this.room, "will be deleted", roomStore);
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
