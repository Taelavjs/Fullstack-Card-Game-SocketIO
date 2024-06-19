import './../App.css';
import { useEffect, useState } from 'react';
import socket from '../socket';
import Card from './card';
import LobbySelector from './lobbySelector';
import { createContext, useContext } from "react";
import { UserContext } from '../App';

const Matchmaking = () => {
  const reconnect = useContext(UserContext);
  const [isHost, setIsHost] = useState(reconnect.isHost !== undefined ? reconnect.isHost : false);
  const [inputValue, setInputValue] = useState("");
  const [errText, setErrorText] = useState("");
  const [match, setMatch] = useState(reconnect ? reconnect.players : null);
  const [gameStart, setGameStart] = useState(reconnect.startStatus === "PLAYING" ? true : false);
  const [deck, setDeck] = useState([]);
  const [winner, setWinner] = useState("");
  const [showLobbyStatus, setShowLobbyStatus] = useState(false);
  const [listLobbys, setListLobbys] = useState([]);
  const [settings, setSettings] = useState(null);
  const [maxPlayers, setMaxPlayers] = useState('');
  const [minPlayers, setMinPlayers] = useState('');

  useEffect(() => {
    if (!isEmpty(reconnect)) {
      setMatch(reconnect.players);
      setIsHost(reconnect.isHost);
    }
  }, [reconnect])

  useEffect(() => {
    socket.on("game-start", deck => {
      setGameStart(true);
      setDeck(deck);
    });

    socket.on("wrong-card-id", deck => {
      setDeck(deck);
    });

    socket.on("deck-update", deck => {
      setDeck(deck);
    });

    socket.on("settings_details", (obj) => {
      setSettings(obj);
    });

    socket.on("winner-decided", (winner) => {
      setWinner(winner);
    });

    return () => {
      socket.off("game-start");
      socket.off("wrong-card-id");
      socket.off("deck-update");
      socket.off("settings_details");
      socket.off("winner-decided");
    };
  }, []);

  const handleCustomSettings = () => {
    socket.emit("match-settings", { maxPlayers, minPlayers }, (cb) => {
      console.log("Settings updated? ", cb);
    });
  };

  const createLobby = (e) => {
    e.preventDefault();
    socket.emit("create-room", inputValue, cb => {
      if (!cb) {
        setErrorText("Invalid Lobby Id");
        return;
      }
      setIsHost(true);
      setMatch(cb);

      socket.on("player-joined", (players) => {
        setMatch(players);
      });
    });
  };

  const joinLobby = (e) => {
    socket.emit("join-room", inputValue, (values) => {
      if (values !== false) {
        setMatch(values);
      }

      socket.on("player-joined", (players) => {
        setMatch(players);
      });
    });
  };

  const joinLobbys = (roomName) => {
    setShowLobbyStatus(false);
    socket.emit("join-room", roomName, (values) => {
      if (values !== false) {
        setMatch(values);
      } else {
        setErrorText("Error Occurred");
      }

      socket.on("player-joined", (players) => {
        setMatch(players);
      });
    });
  };

  const readyUp = () => {
    socket.emit('ready');
  };

  const showLobbys = () => {
    getListLobbys();
    setShowLobbyStatus(!showLobbyStatus);
  };

  const getListLobbys = () => {
    socket.emit("listLobbys", listLobbysInfo => {
      setListLobbys(listLobbysInfo.roomsToClient);
    });
  };

  const isEmpty = (obj) => {
    return obj === undefined || Object.keys(obj).length === 0;
  };

  const biFlagColors = {
    pink: '#D80073',
    purple: '#9B4F96',
    blue: '#3C6EFC',
  };

  return (
    <>
      {!match && (
        <div className="h-screen bg-gradient-to-r from-pastel-blue via-pastel-pink to-pastel-purple flex flex-col justify-center items-center p-4">
          <button
            className="bg-pastel-pink text-white px-6 py-3 rounded-full mb-4"
            onClick={showLobbys}
          >
            View Open Lobbies
          </button>
          <input
            type="text"
            className="border border-gray-300 rounded-full px-4 py-3 bg-pastel-blue-light mb-4"
            onChange={e => setInputValue(e.target.value)}
            placeholder="Enter Lobby Name"
          />
          <button
            className="bg-pastel-blue text-white px-6 py-3 rounded-full mb-4"
            onClick={createLobby}
          >
            Create Lobby
          </button>
          <input
            type="text"
            className="border border-gray-300 rounded-full px-4 py-3 bg-pastel-pink-light mb-4"
            onChange={e => setInputValue(e.target.value)}
            placeholder="Enter Lobby Code"
          />
          <button
            className="bg-pastel-purple text-white px-6 py-3 rounded-full"
            onClick={joinLobby}
          >
            Join Lobby {socket.connected ? 'Connected' : 'Disconnected'}
          </button>
          {errText && <div className="text-pastel-red">{errText}</div>}
        </div>
      )}

      {match && match.length > 0 && !gameStart && (
        <div className="h-screen bg-gradient-to-b from-pastel-purple to-pastel-blue flex flex-col justify-center items-center p-4">
          <div className="text-3xl font-bold text-white mb-6">Players</div>
          <div className="flex flex-col space-y-4 items-center">
            {match.map((playerName, index) => (
              <div key={index} className="bg-pastel-pink text-white px-6 py-3 rounded-full shadow-lg">
                {playerName}
              </div>
            ))}
            <button
              onClick={readyUp}
              className="bg-pastel-purple text-white px-6 py-3 rounded-full hover:bg-pastel-purple-dark transition duration-300 shadow-lg"
            >
              Ready?
            </button>
          </div>
        </div>
      )}

      {match && gameStart && winner === "" && (
        <div className="h-screen bg-gradient-to-br from-pastel-blue to-pastel-purple flex justify-center items-center p-4">
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
        <div className="h-screen bg-gradient-to-r from-pastel-pink via-pastel-blue to-pastel-purple flex flex-col justify-center items-center p-4">
          <div className="text-4xl font-bold text-white mb-6">{winner}</div>
          <button
            className="bg-pastel-pink text-white px-6 py-3 rounded-full hover:bg-pastel-pink-dark transition duration-300 shadow-lg"
            onClick={() => {
              window.location.reload();
            }}
          >
            Back To Menu
          </button>
        </div>
      )}

      <div className="fixed left-0 top-1/2 transform -translate-y-1/2 flex flex-col items-start justify-center space-y-4 bg-gray-200 p-4 rounded-r-lg shadow-md">
        {match?.map((playerName) => (
          <div key={playerName} className="text-pastel-blue-dark">{playerName}</div>
        ))}
      </div>

      <div className="fixed right-0 top-1/2 transform -translate-y-1/2 flex flex-col items-start justify-center space-y-4 bg-gray-200 p-4 rounded-l-lg shadow-md">
        {isHost && match && match.length > 0 && !gameStart && (
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
                  className="border border-gray-300 rounded px-2 py-1"
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
                  className="border border-gray-300 rounded px-2 py-1"
                />
              </li>
            </ul>
            <button
              onClick={handleCustomSettings}
              className="bg-pastel-blue text-white px-4 py-2 rounded hover:bg-pastel-blue-dark transition duration-300 shadow-md"
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

      <div className={`fixed top-0 left-0 w-full h-screen overflow-y-auto ${showLobbyStatus ? 'block' : 'hidden'}`}>
        <div className="flex flex-col justify-center items-center p-4 bg-gradient-to-b from-pink-500 via-purple-500 to-blue-500">
          {listLobbys?.map((lobbyInfo, index) => (
            <LobbySelector
              key={index}
              roomInfo={lobbyInfo}
              setRoomName={() => joinLobbys(lobbyInfo.roomTitle)}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default Matchmaking;
