import './../App.css';
import { useEffect, useState } from 'react';
import socket from '../socket';

const Card = ({ cardValue, cardName, cardID }) => {
    const [isClicked, setIsClicked] = useState(false);

    const selectCard = () => {
        setIsClicked(true); // Set isClicked to true when the card is clicked
        socket.emit("chosen-card", cardID);
        console.log(cardID);
    }

    return (
        <div
            onClick={selectCard}
            className={`card-container border border-green-300 w-3/12 min-h-full flex flex-col justify-center items-center space-y-4
            ease-in ${isClicked ? 'animate-pulse' : ''}`} // Add animate-pulse class conditionally
            style={{
                backgroundImage: `url('/TCG_TEMPLATES/Card_Front_Base.png')`,
                backgroundSize: '100% 100%',
                backgroundPosition: 'center'
            }}
        >
            <div>{cardName}</div>
            <div>{cardValue}</div>
        </div>
    );
}

export default Card;
