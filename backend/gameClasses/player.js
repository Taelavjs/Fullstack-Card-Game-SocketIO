class TimeToDisconnect {
    constructor(timeToDisconnect) {
        this.timeToDisconnect = timeToDisconnect;
    }

    startCountdown() { 

    }
}

class Player {
    /**
     * 
     * @param {int} socketID 
     * @param {string} username 
     * @param {int} sessionID 
     */
    constructor(socketID, username, sessionID) {
        this.socketID = socketID;
        this.username = username;
        this.deck = [];
        this.readyStatus = false;
        this.selectedCard = null;
        this.noCardsRemaining = false;
        this.sessionID = sessionID
        this.timeToDisconnect
    }

    matchStart() {
        let io = require('../socket').getio();

        io.to(this.socketID).emit("startMatch");
    }

    setDeck(deck) {
        this.deck = deck;
    }

    getSocket() {
        let io = require('../socket').getio();

        return io.to(this.socketID);
    }

    

    /**
     * Triggered every turn of the player
     * Rejects if no card with said ID is found
     * Resolves and returns the selected card if found in players deck
     * Listens once to disconnect, in which case it will reject with an error
     * Listens once to player input, which will reset if the card is not found
     */
    async chosenCardListener() {
        return new Promise((resolve, reject) => {
            if (this.selectedCard !== null) {
                resolve(this.selectedCard);
                return;
            }

            let io = require('../socket').getio();
            try {
                io.sockets.sockets.get(this.socketID).once("disconnect", (reason) => {
                    reject("card not exist");
                });
    
                io.sockets.sockets.get(this.socketID).once("chosen-card", (arg, cb) => {
    
                    let foundCard = this.checkCardExists(arg);
                    if (typeof foundCard === 'object') {
                        cb(true)
                        resolve(foundCard);
                    } else {
                        cb(false);
                        reject(new Error(foundCard));
                    }
                });
            } catch (error) {
                console.log("ERR : SOCKET ID IS OLD : ", this.socketID);
            }
 
        });
    }

    checkCardExists(cardID) {
        if(this.selectedCard) { return this.selectedCard;}
        let cardsToCheckAgainst = this.getAccessiblePlayersCards()
        console.log("checking in here ", cardsToCheckAgainst);
        for (let index = 0; index < cardsToCheckAgainst.length; index++) {
            const card = cardsToCheckAgainst[index];
            console.log(card);
            console.log("ABC");
            console.log(cardID);
            if (card.id === parseInt(cardID)) {
                this.selectedCard = card;
                return card;
            }
        }
        return "card not exist";
    }

    requestDeck(){
        let io = require('../socket').getio();
        io.sockets.sockets.get(this.socketID).once("req-deck", (arg, ack) => {
            ack(this.getAccessiblePlayersCards());
        })
    }

    removeCard(){

        for (let index = 0; index < this.deck.length; index++) {
            const card = this.deck[index];
            if (card.id === this.selectedCard.id) {
                this.deck.splice(index, 1);                
            }
        }
    }

    resetChosenCard() {
        this.selectedCard = null;
    }

    sendDeck() {
        let io = require('../socket').getio();
        let deckToGivePlayer = this.getAccessiblePlayersCards();
        io.to(this.socketID).emit("deck-update", deckToGivePlayer);
    }

    resetReadyStatus(){
        this.readyStatus = false;
    }
    
    getAccessiblePlayersCards(){
        let array2;
        
        if (this.deck.length > 1) {
            array2 = [0, 1];
        } else if (this.deck.length === 0) {
            this.noCardsRemaining = true;
            return;
        } else if (this.deck.length === 1) {
            array2 = [0];  // Handle the case where there is exactly one card
        }
    
        let deckToGivePlayer = array2.map(i => this.deck[i]);
        return deckToGivePlayer;
    }


    setReadyStatus(status) {
        this.readyStatus = status;
    }

    getReadyStatus() {
        return this.readyStatus;
    }

    addCardToDeck(cards) {
        cards.forEach(card => {
            this.deck.push(card);
        });
    }

    newSocketID(newSocketID) {
        this.socketID = newSocketID;
    }

    sendWinnerToPLayer(winner) {
        this.getSocket().emit("winner-decided", winner);

    }

    removeListeners(){
        let io = require('../socket').getio();
        console.log(this.socketID);
        console.log(io.sockets.sockets.get(this.socketID).socket);
        io.sockets.sockets.get(this.socketID).removeAllListeners("req-deck")
        io.sockets.sockets.get(this.socketID).removeAllListeners("disconnect")
        io.sockets.sockets.get(this.socketID).removeAllListeners("chosen-card")
        io.sockets.sockets.get(this.socketID).removeAllListeners("ready")
    }

    


}

module.exports = Player;