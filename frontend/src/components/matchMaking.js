import './../App.css';
import { useEffect, useState } from 'react';
import socket from '../socket';
import Card from './card';
import LobbySelector from './lobbySelector';
import { createContext, useContext } from "react";
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

  const handleUsernamesList = (obj) => {

  }

  function isEmpty(obj) {
    if (obj === undefined) {
      return false;
    }
    return Object.keys(obj).length === 0;
  }

  const readyUp = () => {
    socket.emit('ready');
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



  const biFlagColors = {
    pink: '#D80073',
    purple: '#9B4F96',
    blue: '#3C6EFC',
  };


  return (
<>
  {!match && (
    <LobbyInput isHost={isHost} setIsHost={setIsHost} setMatch={setMatch} socket={socket}  />
  )}

  {match && match.length > 0 && !gameStart && (
    <LobbyReadyScreen readyUp = {readyUp} match={match}/>
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
