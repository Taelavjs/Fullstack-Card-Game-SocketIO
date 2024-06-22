import { useEffect, useState } from "react";

import Card from '../components/card';
const GameScreen = ({setGameStart, socket}) => {
    const [deck, setDeck] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);

      useEffect(() => {
        socket.on("deck-update", deck => {
          setSelectedCard(null);
          setDeck(deck);
        })

        socket.on("wrong-card-id", deck => {
          setSelectedCard(null);
          setDeck(deck);
        })
      }, [socket])


      console.log("selected : ", selectedCard);


    return (
    
        <div className="relative h-screen w-full bg-gradient-to-br from-pastel-blue to-pastel-purple overflow-hidden flex justify-center items-center">
            <div className="flex space-x-8">
                {deck?.slice(0, 2).map((cardo, index) => (
                <Card
                    key={cardo.id}
                    cardValue={cardo.value}
                    cardName={cardo.suit}
                    cardID={cardo.id}
                    setSelectedCard={setSelectedCard}
                    isSelected={cardo.id === selectedCard}
                />
                ))}
            </div>
        </div>
    
    )
}

export default GameScreen;