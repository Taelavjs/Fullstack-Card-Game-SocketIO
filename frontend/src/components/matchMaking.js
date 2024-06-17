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

  const [inputValue, setInputValue] = useState("");
  const [errText, setErrorText] = useState("");
  const [match, setMatch] = useState();
  const [gameStart, setGameStart] = useState(reconnect.startStatus === "PLAYING" ? true : false);
  const [deck, setDeck] = useState();
  const [winner, setWinner] = useState("");
  const [showLobbyStatus, setShowLobbyStatus] = useState(false);
  const [listLobbys, setListLobbys] = useState([]);
  const onChangeHandler = event => {
    setInputValue(event.target.value);
  };
  useEffect(() => {
    if (!isEmpty(reconnect)) {
      console.log(reconnect);
      console.log("Game start var : ", gameStart, match);
      setMatch({
        hostName: reconnect.host,
        oppName: reconnect.opponent,
      });
      console.log(match);
    }
  }, [reconnect])

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
        setErrorText("Invalid Lobby Id");
        return;
      }
      socket.once("player-joined", ({ hostUsn, opponentUsn }) => {
        setMatch({
          hostName: hostUsn,
          oppName: opponentUsn,
        });
        console.log(hostUsn, opponentUsn);
      })

      console.log(cb);
    });

  }



  const joinLobby = (e) => {
    socket.emit("join-room", inputValue, (values) => {
      if (values !== false) {
        let { hostUsn, opponentUsn } = values;
        setMatch({
          hostName: hostUsn,
          oppName: opponentUsn,
        });
      }
    })
  }

  const joinLobbys = (roomName) => {
    setShowLobbyStatus(false);
    socket.emit("join-room", roomName, (values) => {
      if (values !== false) {
        let { hostUsn, opponentUsn } = values;
        setMatch({
          hostName: hostUsn,
          oppName: opponentUsn,
        });
      }
    })
  }

  const readyUp = () => {
    socket.emit('ready');
  }

  socket.on("game-start", deck => {
    setGameStart(true);
    setDeck([]);

    setDeck(deck);
    console.log(deck);
    console.log("start her up");
    console.log(socket);

  })

  socket.on("wrong-card-id", deck => {
    setDeck([]);
    setDeck(deck);
    console.log("wrong id");
  })

  socket.on("deck-update", deck => {
    setDeck([]);

    setDeck(deck);
  })

  socket.on("winner-decided", (winner) => {
    console.log(winner);
    setWinner(winner);
  })

  const showLobbys = () => {
    getListLobbys();
    setShowLobbyStatus(!showLobbyStatus);
  }

  const getListLobbys = () => {
    socket.emit("listLobbys", listLobbysInfo => {
      setListLobbys(listLobbysInfo.roomsToClient);
      console.log(listLobbysInfo);
    })
  }



  console.log(deck);
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

      {
        showLobbyStatus && 
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col justify-centera'>
          {listLobbys?.map((lobbyInfo, index) => {
            console.log(lobbyInfo);
            return <LobbySelector roomInfo = {lobbyInfo} setRoomName = {() => {joinLobbys(lobbyInfo.roomTitle)}}/>
          })}
        </div>
      }

      {
        //Checks If Match has been joined, and game HAS NOT started
      }
      {match && !gameStart &&

        <div className='flex flex-col justify-center items-center h-screen w-9/12 mr-auto'>
          <div className='border w-9/12 h-64 flex flex-row justify-center items-center space-x-7'>
            {match.oppName}
          </div>
          <div>
            {match.hostName}
          </div>
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
