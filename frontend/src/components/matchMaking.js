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
  console.log("isHost : ", isHost);

  const [match, setMatch] = useState(reconnect ? reconnect.players : null);
  const [gameStart, setGameStart] = useState(reconnect.startStatus === "PLAYING" ? true : false);
  const [winner, setWinner] = useState("");

  useEffect(() => {
    if (!isEmpty(reconnect)) {
      setMatch(reconnect.players);
      setIsHost(reconnect.isHost);
    }
  }, [reconnect])

  function isEmpty(obj) {
    if (obj === undefined) {
      return false;
    }
    return Object.keys(obj).length === 0;
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
    }, 100)} // Delay in milliseconds
  });

  console.log("match : ", match);

  return (
<>
  {!match && (
    <LobbyInput isHost={isHost} setIsHost={setIsHost} setMatch={setMatch} socket={socket}  />
  )}

  {match && match.length > 0 && !gameStart && (
    <LobbyReadyScreen match={match} socket={socket}/>
  )}

  {match && gameStart && winner === "" && (
    <GameScreen socket={socket} setGameStart={setGameStart} />
  )}

  {match && gameStart && winner !== "" && (
    <GameWinScreen winner={winner} />
  )}

  <PlayerListSidebar match={match} />

  <SettingsSidebar match={match} isHost={isHost} socket={socket} gameStart={gameStart} />

</>

  );
}

export default Matchmaking;
