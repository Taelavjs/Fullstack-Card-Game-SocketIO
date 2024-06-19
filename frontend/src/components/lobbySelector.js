import './../App.css';
import { useEffect, useState } from 'react';
import socket from '../socket';

const LobbySelector = ({roomInfo, setRoomName}) => {
    console.log(roomInfo);
    const { numPlayers, maxNumPlayers, hostName, roomTitle } = roomInfo;

    return(
        <div className='border flex flex-row justify-center items-center space-x-7' onClick={() => setRoomName()}>
            <div>{numPlayers}/{maxNumPlayers}</div>
            <div>{roomTitle}</div>
            <div>{hostName}</div>
        </div> 
    )
}

export default LobbySelector;
