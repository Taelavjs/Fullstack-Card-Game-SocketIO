import './../App.css';
import { useEffect, useState } from 'react';
import socket from '../socket';
import Card from './card';
import LobbySelector from './lobbySelector';
import { createContext, useContext } from "react";
import { UserContext } from '../App';

const UsernameComponent = () => {

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
  function handleCustomSettings () {
    console.log("button clicked");
    socket.emit("match-settings", {maxPlayers, minPlayers}, (cb) => {
      console.log("settings updated? ", cb);
    });
  }

  return (

    <>
      {
        //Checks if match has not been joined
      }
      {!match && <div className='flex flex-col justify-center h-screen  w-6/12 mr-auto'>
        <div className='flex flex-row justify-evenly items-center'>
          <button onClick={showLobbys}>View Open Lobbys</button>
        </div>
        <div className='flex flex-row justify-evenly items-center'>
          <input type="text" className='border' onChange={onChangeHandler}></input>
          <button onClick={createLobby}>Create Lobby</button>
        </div>
        <div className='flex flex-row justify-evenly items-center'>
          <input type="text" className='border' onChange={onChangeHandler}></input>
          <button onClick={joinLobby}>Join Lobby {socket.connected}</button>
          {errText}
        </div>
      </div>}

      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 flex flex-col items-start justify-center space-y-4 bg-gray-200 p-4 rounded-r-lg">
        {match?.map((playerName) => {
          return <>
            <div>{playerName}</div>
          </>
        })}
      </div>

      <div>
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex flex-col items-start justify-center space-y-4 bg-gray-200 p-4 rounded-l-lg">

      {isHost && match != undefined && match.length > 0 && !gameStart &&(
        <div>
          <ul>
            <li>
              <label htmlFor="maxPlayers">Max Number of Players:</label>
              <input 
                type="number" 
                id="maxPlayers" 
                name="maxPlayers" 
                value={maxPlayers} 
                onChange={(e) => setMaxPlayers(e.target.value)}
                required 
              />
            </li>
            <li>
              <label htmlFor="minPlayers">Min Number of Players:</label>
              <input 
                type="number" 
                id="minPlayers" 
                name="minPlayers" 
                value={minPlayers} 
                onChange={(e) => setMinPlayers(e.target.value)}
                required 
              />
            </li>
          </ul>
          <button onClick={handleCustomSettings}>Submit</button>
        </div>
      )}
      <div className='flex flex-row'>
        <div>Max Players : </div><div>{settings?.maxPlayers}</div>
      </div>      
      <div className='flex flex-row'>
        <div>Min Players : </div><div>{settings?.minPlayers}</div>
      </div>      
      <div className='flex flex-row'>
        <div>Timer : </div><div>{settings?.timer}</div>
      </div>
    </div>
    </div>
    
      

      {
        showLobbyStatus && 
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col justify-centera'>
          {listLobbys?.map((lobbyInfo, index) => {
            return <LobbySelector roomInfo = {lobbyInfo} setRoomName = {() => {joinLobbys(lobbyInfo.roomTitle)}}/>
          })}
        </div>
      }

      {
        //Checks If Match has been joined, and game HAS NOT started
      }
      {match != undefined && match.length > 0 && !gameStart &&

        <div className='flex flex-col justify-center items-center h-screen w-9/12 mr-auto'>
          {match.map((playerName, index) => {
            return <><div>
              {playerName}
            </div></>
          })}

          <button onClick={readyUp}>Ready?</button>

        </div>}

      {
        //Checks If Match has been joined, game has started and there is no winner.
      }
      {match && gameStart && winner == "" &&
        <div className='flex flex-col justify-center items-center h-screen'>
          <div className='border w-9/12 h-64 flex flex-row justify-center items-center space-x-7'>
            {deck?.map((cardo, index) => (
              <Card cardValue={cardo.value} cardName={cardo.suit} cardID={cardo.id} key={cardo.id} />
            ))}
          </div>
        </div>}
      {
        //Checks If Match has been joined, game has started and there IS A winner.
      }
      {match && gameStart && winner != "" &&
        <div className='flex flex-col justify-center items-center'>
          <div>{winner}</div>
          <div><button className='border' onClick={() => {
            window.location.reload();
          }}>Back To Menu</button></div>

        </div>}
    </>
  );
}

export default UsernameComponent;
