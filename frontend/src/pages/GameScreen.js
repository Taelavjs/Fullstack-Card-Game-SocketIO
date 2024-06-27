import { useEffect, useState } from "react";
import Card from '../components/card';


const GameScreen = ({ setGameStart, socket }) => {
  const [deck, setDeck] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    socket.emit("req-deck", (deck) => {
      console.log("Received deck:", deck);
      setDeck(deck);
    });

    const handleDeckUpdate = (deck) => {
      console.log("DECK RECEIVED");
      console.log("Deck updated:", deck);
      setSelectedCard(null);
      setDeck(deck);
    };

    const handleWrongCardId = (deck) => {
      console.log("Wrong card ID, resetting deck:", deck);
      setSelectedCard(null);
      setDeck(deck);
    };

    socket.on("deck-update", handleDeckUpdate);
    socket.on("wrong-card-id", handleWrongCardId);

    return () => {
      socket.off("deck-update", handleDeckUpdate);
      socket.off("wrong-card-id", handleWrongCardId);
    };
  }, [socket]);

  useEffect(() => {
    socket.off("player-joined");
  }, [deck, socket]);

  console.log("Current deck:", deck);
  console.log("Selected card:", selectedCard);

  return (
    <div className="relative h-screen w-full bg-gradient-to-br from-pastel-blue to-pastel-purple overflow-hidden flex justify-center items-center">
      <div className="flex space-x-8">
        {deck?.slice(0, 2).map((cardo, index) => (
          <Card
            key={Math.floor(Math.random() * 1000000)}
            cardValue={cardo.value}
            cardName={cardo.suit}
            cardID={cardo.id}
            setSelectedCard={setSelectedCard}
            isSelected={cardo.id === selectedCard}
          />
        ))}
      </div>
    </div>
  );
};

export default GameScreen;
