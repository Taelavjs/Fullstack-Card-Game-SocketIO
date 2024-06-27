import { useState } from 'react';
import socket from '../socket';

const Card = ({ cardValue, cardName, cardID, setSelectedCard, isSelected }) => {
  const [flag, setFlag] = useState(false);

  const selectCard = () => {
    if (flag) {
      console.log("Request already in progress, ignoring click.");
      return;
    }

    setFlag(true);
    console.log("Sending chosen-card event for cardID:", cardID);

    socket.emit('chosen-card', cardID, (cb) => {
      console.log("Callback : ", cb);
      if (cb) {
        setSelectedCard(cardID);
        console.log("Card selection successful:", cardID);
      } else {
        setSelectedCard(null);
        console.log("Card selection failed, resetting selected card.");
      }
      setFlag(false);  // Reset flag only after server response
    });
  };

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
