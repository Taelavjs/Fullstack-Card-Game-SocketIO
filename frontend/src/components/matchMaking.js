import './../App.css';
import { useEffect, useState } from 'react';
import socket from '../socket';
import Card from './card';
import LobbySelector from './lobbySelector';
import { createContext, useContext } from "react";
import { UserContext } from '../App';
import LobbyInput from './LobbyInput';
import LobbyReadyScreen from './LobbyReadyScreen';

const Matchmaking = () => {

  const reconnect = useContext(UserContext);
  console.log("Using context, the object's : ", reconnect);
  const [isHost, setIsHost] = useState(reconnect.isHost !== undefined ? reconnect.isHost : false);
  console.log("isHost : ", isHost);

  const [match, setMatch] = useState(reconnect ? reconnect.players : null);
  const [gameStart, setGameStart] = useState(reconnect.startStatus === "PLAYING" ? true : false);
  const [deck, setDeck] = useState();
  const [winner, setWinner] = useState("");
  const [settings, setSettings] = useState(null);

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

  socket.on("game-start", deck => {
    setGameStart(true);
    setDeck([]);

    setDeck(deck);

  })

  socket.on("wrong-card-id", deck => {
    setDeck([]);
    setDeck(deck);
  })

  socket.on("deck-update", deck => {
    setDeck([]);

    setDeck(deck);
  })

  socket.on("settings_details", (obj) => {
    console.log("THIS RAN SETTINGS UPDATE");
    setSettings(obj);
    console.log("SETTINGS : ", settings);
  })

  socket.on("winner-decided", (winner) => {
    setWinner(winner);
  })

  console.log("match : ", match);
  const [maxPlayers, setMaxPlayers] = useState('');
  const [minPlayers, setMinPlayers] = useState('');
  function handleCustomSettings() {
    console.log("button clicked");
    socket.emit("match-settings", { maxPlayers, minPlayers }, (cb) => {
      console.log("settings updated? ", cb);
    });
  }

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
  )}

  {match && gameStart && winner !== "" && (
    <div className="relative h-screen w-full bg-gradient-to-r from-pastel-pink via-pastel-blue to-pastel-purple overflow-hidden flex flex-col justify-center items-center">
      <div className="text-4xl font-bold text-white mb-6">{winner}</div>
      <button
        className="bg-pastel-pink text-white px-6 py-3 rounded-none hover:bg-pastel-pink-dark transition duration-300 shadow-lg transform hover:-translate-y-1 hover:scale-105"
        onClick={() => {
          window.location.reload();
        }}
      >
        Back To Menu
      </button>
    </div>
  )}

  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 flex flex-col items-start justify-center space-y-4 bg-gray-200 p-4 rounded-none shadow-md">
    {match?.map((playerName) => (
      <div key={playerName} className="text-pastel-blue-dark">{playerName}</div>
    ))}
  </div>

  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex flex-col items-start justify-center space-y-4 bg-gray-200 p-4 rounded-none shadow-md">
    {isHost && match != undefined && match.length > 0 && !gameStart && (
      <div className="space-y-4">
        <ul className="space-y-2">
          <li className="flex flex-col space-y-1">
            <label htmlFor="maxPlayers" className="text-gray-700">Max Number of Players:</label>
            <input
              type="number"
              id="maxPlayers"
              name="maxPlayers"
              defaultValue={settings ? settings.maxPlayers : 0}
              onChange={(e) => setMaxPlayers(e.target.value)}
              required
              className="border border-gray-300 rounded-none px-2 py-1"
            />
          </li>
          <li className="flex flex-col space-y-1">
            <label htmlFor="minPlayers" className="text-gray-700">Min Number of Players:</label>
            <input
              type="number"
              id="minPlayers"
              name="minPlayers"
              defaultValue={settings ? settings.minPlayers : 0}
              onChange={(e) => setMinPlayers(e.target.value)}
              required
              className="border border-gray-300 rounded-none px-2 py-1"
            />
          </li>
        </ul>
        <button
          onClick={handleCustomSettings}
          className="bg-pastel-blue text-white px-4 py-2 rounded-none hover:bg-pastel-blue-dark transition duration-300 shadow-md"
        >
          Submit
        </button>
      </div>
    )}
    <div className='flex flex-row space-x-2'>
      <div className="text-gray-700">Max Players: </div><div className="text-pastel-blue-dark">{settings?.maxPlayers}</div>
    </div>
    <div className='flex flex-row space-x-2'>
      <div className="text-gray-700">Min Players: </div><div className="text-pastel-blue-dark">{settings?.minPlayers}</div>
    </div>
    <div className='flex flex-row space-x-2'>
      <div className="text-gray-700">Timer: </div><div className="text-pastel-blue-dark">{settings?.timer}</div>
    </div>
  </div>


</>

  );
}

export default Matchmaking;
