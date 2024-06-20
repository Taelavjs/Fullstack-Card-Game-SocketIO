import './../App.css';
import { useEffect, useState } from 'react';
import socket from '../socket';

const LobbySelector = ({roomInfo, setRoomName}) => {
    console.log(roomInfo);
    const { numPlayers, maxNumPlayers, hostName, roomTitle } = roomInfo;

    return (
        <div className="border border-gray-300 rounded-md flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-100 transition duration-300" onClick={() => setRoomName()}>
          <div className="text-pastel-purple font-bold">
            {numPlayers}/{maxNumPlayers}
          </div>
          <div className="text-pastel-blue">
            {roomTitle}
          </div>
          <div className="text-pastel-pink">
            {hostName}
          </div>
        </div>
      );
      
}

export default LobbySelector;
