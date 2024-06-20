import { useEffect, useState } from "react";

import Card from './card';
const GameScreen = ({setGameStart, socket}) => {
    const [deck, setDeck] = useState([]);





      useEffect(() => {
        socket.on("deck-update", deck => {
          setDeck([]);
      
          setDeck(deck);
        })

        socket.on("wrong-card-id", deck => {
          setDeck([]);
          setDeck(deck);
        })
      }, [socket])


    return (
    
        <div className="relative h-screen w-full bg-gradient-to-br from-pastel-blue to-pastel-purple overflow-hidden flex justify-center items-center">
            <div className="flex space-x-8">
                {deck?.slice(0, 2).map((cardo, index) => (
                <Card
                    key={cardo.id}
                    cardValue={cardo.value}
                    cardName={cardo.suit}
                    cardID={cardo.id}
                />
                ))}
            </div>
        </div>
    
    )
}

export default GameScreen;