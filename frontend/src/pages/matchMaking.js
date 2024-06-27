import './../App.css';
import { useEffect, useState } from 'react';
import socket from '../socket';
import { useContext } from "react";
import { UserContext } from '../App';
import LobbyInput from './LobbyInput';
import LobbyReadyScreen from './LobbyReadyScreen';
import GameScreen from './GameScreen';
import GameWinScreen from './GameWinScreen';
import PlayerListSidebar from './PlayerListSidebar';
import SettingsSidebar from './SettingsSidebar';
const Matchmaking = () => {
  const reconnect = useContext(UserContext);
  console.log("Using context, the object's : ", reconnect);
  const [isHost, setIsHost] = useState(reconnect.isHost !== undefined ? reconnect.isHost : false);
  
  const [match, setMatch] = useState(reconnect ? reconnect.players : null);
  const [gameStart, setGameStart] = useState(reconnect.startStatus === "PLAYING" ? true : false);
  const [winner, setWinner] = useState("");
  const [readyStatus, setReadyStatus] = useState(false);
  console.log("ready status : ", readyStatus);

  useEffect(() => {
    if (!isEmpty(reconnect)) {
      setMatch(reconnect.players);
      setIsHost(reconnect.isHost);
    }

    socket.on("winner-decided", (winner) => {
      setWinner(winner);
    })
  
    socket.on("game-start", (callback) => {
      setGameStart(true);
      console.log("this runs")
      // Acknowledge the server
      if (callback) {
        setTimeout(() => {
          callback(true); // Optionally, you can pass data back to the server
          console.log("then this runs");
        }, 100)
      } // Delay in milliseconds
    });

    socket.on("room-shutdown", () => {
      console.log("room closed cause host left");
      window.location.reload();
    })

    return () => {
      socket.off("room-shutdown");

      socket.off("game-start");
      socket.off("winner-decided");
    }
  }, [reconnect])

  function isEmpty(obj) {
    if (obj === undefined) {
      return false;
    }
    return Object.keys(obj).length === 0;
  }



  console.log("match : ", match);

  return (
    <>
      <div className='flex flex-col md:flex-row w-screen h-screen justify-evenly'>
        <div className="w-full md:w-1/3 mb-4 md:mb-0 hidden md:block">
          <PlayerListSidebar match={match} />
        </div>
        <div className="w-full md:w-1/3 mb-4 md:mb-0">
          {!match && (
            <LobbyInput isHost={isHost} setIsHost={setIsHost} setMatch={setMatch} socket={socket} setReadyStatus={setReadyStatus}/>
          )}
          {match && match.length > 0 && !gameStart && (
            <LobbyReadyScreen match={match} socket={socket} readyStatus={readyStatus} setReadyStatus={setReadyStatus} />
          )}
          {match && gameStart && winner === "" && (
            <GameScreen socket={socket} setGameStart={setGameStart} />
          )}
        </div>
        <div className="w-full md:w-1/3 md:h-full">
          <SettingsSidebar match={match} isHost={isHost} socket={socket} gameStart={gameStart} />
        </div>
      </div>
      {match && gameStart && winner !== "" && (
        <GameWinScreen winner={winner} />
      )}
    </>

  );
}

export default Matchmaking;
