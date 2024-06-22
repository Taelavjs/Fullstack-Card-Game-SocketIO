import { useState } from 'react';
import socket from '../socket';

const Card = ({ cardValue, cardName, cardID, setSelectedCard, isSelected }) => {

  const selectCard = () => {
    socket.emit('chosen-card', cardID, cb => {
      setSelectedCard(cardID); // Set isClicked to true when the card is clicked
      console.log(cardID);

      if (!cb) {
        setSelectedCard(null); // Set isClicked to true when the card is clicked
        return;
      }
    });
  };

  // Pastel colors inspired by the bisexual flag
  const pastelColors = {
    pink: '#FFB6C1',
    purple: '#9370DB',
    blue: '#87CEFA',
  };

  return (
    <div
      onClick={selectCard}
      className={`card-container border border-gray-300 w-48 h-72 flex flex-col justify-center items-center space-y-4 ${isSelected ? 'animate-pulse' : ''}`}
      style={{
        backgroundImage: `linear-gradient(to bottom right, ${pastelColors.pink}, ${pastelColors.purple}, ${pastelColors.blue})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        cursor: 'pointer',
      }}
    >
      <div className="text-white font-bold">{cardName}</div>
      <div className="text-white">{cardValue}</div>
    </div>
  );
};

export default Card;
