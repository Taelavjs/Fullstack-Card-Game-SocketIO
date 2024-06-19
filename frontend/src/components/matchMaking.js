import './../App.css';
import { useEffect, useState } from 'react';
import socket from '../socket';
import Card from './card';
import LobbySelector from './lobbySelector';
import { createContext, useContext } from "react";
import { UserContext } from '../App';

const Matchmaking = () => {

  const reconnect = useContext(UserContext);
  console.log("Using context, the object's : ", reconnect);
  const [isHost, setIsHost] = useState(reconnect.isHost !== undefined ? reconnect.isHost : false);
  console.log("isHost : ", isHost);

  const [inputValue, setInputValue] = useState("");
  const [errText, setErrorText] = useState("");
  const [match, setMatch] = useState(reconnect ? reconnect.players : null);
  const [gameStart, setGameStart] = useState(reconnect.startStatus === "PLAYING" ? true : false);
  const [deck, setDeck] = useState();
  const [winner, setWinner] = useState("");
  const [showLobbyStatus, setShowLobbyStatus] = useState(false);
  const [listLobbys, setListLobbys] = useState([]);
  const [settings, setSettings] = useState(null);
  const onChangeHandler = event => {
    setInputValue(event.target.value);
  };
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

  const createLobby = (e) => {
    e.preventDefault();
    socket.emit("create-room", inputValue, cb => {
      if (!cb) {
        console.log("CREATED ROOM INSUCCESSFULLY");
        setErrorText("Invalid Lobby Id");
        return;
      }
      console.log("CREATED ROOM ", inputValue);
      setIsHost(true);
      setMatch(cb);

      socket.on("player-joined", (players) => {
        setMatch(players);
        console.log("PLAYERS IN ROOM ", players);
      })

    });

  }



  const joinLobby = (e) => {
    socket.emit("join-room", inputValue, (values) => {
      console.log("JOINGED ROOM RETURNED : ", values);

      if (values !== false) {
        setMatch(values);
      }

      socket.on("player-joined", (players) => {
        setMatch(players);
        console.log("PLAYERS IN ROOM ", players);
      })
    })
  }

  const joinLobbys = (roomName) => {
    setShowLobbyStatus(false);
    socket.emit("join-room", roomName, (values) => {
      console.log(roomName, values);
      console.log("JOINGED ROOM RETURNED : ", values);

      if (values !== false) {
        setMatch(values);
      } else {
        setErrorText("Error Occured");
      }

      socket.on("player-joined", (players) => {
        setMatch(players);
        console.log("PLAYERS IN ROOM ", players);
      })
    })
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

  const showLobbys = () => {
    getListLobbys();
    setShowLobbyStatus(!showLobbyStatus);
  }

  const getListLobbys = () => {
    socket.emit("listLobbys", listLobbysInfo => {
      setListLobbys(listLobbysInfo.roomsToClient);
    })
  }

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
        <div className="relative h-screen w-full bg-gradient-to-r from-pastel-blue via-pastel-pink to-pastel-purple overflow-hidden">
          <div className="absolute top-10 left-1/4 w-1/2 text-center">
            <button
              className="bg-pastel-pink text-white px-6 py-3 rounded-full hover:bg-pastel-pink-dark transition duration-300 shadow-lg transform hover:-translate-y-1 hover:scale-105"
              onClick={showLobbys}
            >
              View Open Lobbys
            </button>
          </div>
          <div className="absolute top-1/3 left-1/4 w-1/2 text-center">
            <input
              type="text"
              className="border border-gray-300 rounded-full px-4 py-3 bg-pastel-blue-light shadow-lg"
              onChange={onChangeHandler}
              placeholder="Lobby Name"
            />
            <button
              className="bg-pastel-blue text-white px-6 py-3 ml-3 rounded-full hover:bg-pastel-blue-dark transition duration-300 shadow-lg transform hover:-translate-y-1 hover:scale-105"
              onClick={createLobby}
            >
              Create Lobby
            </button>
          </div>
          <div className="absolute top-1/2 left-1/4 w-1/2 text-center">
            <input
              type="text"
              className="border border-gray-300 rounded-full px-4 py-3 bg-pastel-pink-light shadow-lg"
              onChange={onChangeHandler}
              placeholder="Lobby Code"
            />
            <button
              className="bg-pastel-purple text-white px-6 py-3 ml-3 rounded-full hover:bg-pastel-purple-dark transition duration-300 shadow-lg transform hover:-translate-y-1 hover:scale-105"
              onClick={joinLobby}
            >
              Join Lobby {socket.connected ? 'Connected' : 'Disconnected'}
            </button>
          </div>
          {errText && <div className="absolute top-2/3 left-1/4 w-1/2 text-center text-pastel-red">{errText}</div>}
        </div>
      )}

      {match && match.length > 0 && !gameStart && (
        <div className="relative h-screen w-full bg-gradient-to-b from-pastel-purple to-pastel-blue overflow-hidden">
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-center text-3xl font-bold text-white">
            Players
          </div>
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 flex flex-col space-y-4 items-center">
            {match.map((playerName, index) => (
              <div key={index} className="bg-pastel-pink text-white px-6 py-3 rounded-full shadow-lg">
                {playerName}
              </div>
            ))}
            <button
              onClick={readyUp}
              className="bg-pastel-purple text-white px-6 py-3 rounded-full hover:bg-pastel-purple-dark transition duration-300 shadow-lg transform hover:-translate-y-1 hover:scale-105"
            >
              Ready?
            </button>
          </div>
        </div>
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
            className="bg-pastel-pink text-white px-6 py-3 rounded-full hover:bg-pastel-pink-dark transition duration-300 shadow-lg transform hover:-translate-y-1 hover:scale-105"
            onClick={() => {
              window.location.reload();
            }}
          >
            Back To Menu
          </button>
        </div>
      )}

      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 flex flex-col items-start justify-center space-y-4 bg-gray-200 p-4 rounded-r-lg shadow-md">
        {match?.map((playerName) => (
          <div key={playerName} className="text-pastel-blue-dark">{playerName}</div>
        ))}
      </div>

      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex flex-col items-start justify-center space-y-4 bg-gray-200 p-4 rounded-l-lg shadow-md">
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


      <div className={`fixed top-0 left-0 w-full h-screen overflow-y-auto ${showLobbyStatus ? 'slide-in' : 'slide-out'}`}>
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
