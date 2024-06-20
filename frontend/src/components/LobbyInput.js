
import { createContext, useContext, useState } from "react";
import LobbySelector from "./lobbySelector";
const LobbyInput = ({setIsHost, setMatch, socket}) => {
    const [errText, setErrorText] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [listLobbys, setListLobbys] = useState([]);
    const [showLobbyStatus, setShowLobbyStatus] = useState(false);

    const onChangeHandler = event => {
        setInputValue(event.target.value);
    };
    
    const joinLobbys = (roomName) => {
        setShowLobbyStatus(false);
        socket.emit("join-room", roomName, (values) => {
          console.log(roomName, values);
          console.log("JOINGED ROOM RETURNED : ", values);
    
          if (values !== false) {
            setMatch(values);
          } else {
            //setErrorText("Error Occured");
          }
    
          socket.on("player-joined", (players) => {
            setMatch(players);
            console.log("PLAYERS IN ROOM ", players);
          })
        })
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


    const showLobbys = () => {
        getListLobbys();
        setShowLobbyStatus(!showLobbyStatus);
    }

    const getListLobbys = () => {
        socket.emit("listLobbys", listLobbysInfo => {
            setListLobbys(listLobbysInfo.roomsToClient);
        })
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

    return (
    
    <>
        <div className="relative h-screen w-full bg-gradient-to-r from-pastel-blue via-pastel-pink to-pastel-purple overflow-hidden">
        <div className="absolute top-10 left-1/4 w-1/2 text-center">
            <button
            className="bg-pastel-pink text-white px-6 py-3 rounded-none hover:bg-pastel-pink-dark transition duration-300 shadow-lg transform hover:-translate-y-1 hover:scale-105"
            onClick={showLobbys}
            >
            View Open Lobbies
            </button>
        </div>
        <div className="absolute top-1/3 left-1/4 w-1/2 text-center">
            <input
            type="text"
            className="border border-gray-300 rounded-none px-4 py-3 bg-pastel-blue-light shadow-lg"
            onChange={onChangeHandler}
            placeholder="Lobby Name"
            />
            <button
            className="bg-pastel-blue text-white px-6 py-3 ml-3 rounded-none hover:bg-pastel-blue-dark transition duration-300 shadow-lg transform hover:-translate-y-1 hover:scale-105"
            onClick={createLobby}
            >
            Create Lobby
            </button>
        </div>
        <div className="absolute top-1/2 left-1/4 w-1/2 text-center">
            <input
            type="text"
            className="border border-gray-300 rounded-none px-4 py-3 bg-pastel-pink-light shadow-lg"
            onChange={onChangeHandler}
            placeholder="Lobby Code"
            />
            <button
            className="bg-pastel-purple text-white px-6 py-3 ml-3 rounded-none hover:bg-pastel-purple-dark transition duration-300 shadow-lg transform hover:-translate-y-1 hover:scale-105"
            onClick={joinLobby}
            >
            Join Lobby {socket.connected ? 'Connected' : 'Disconnected'}
            </button>
        </div>
        {errText && <div className="absolute top-2/3 left-1/4 w-1/2 text-center text-pastel-red">{errText}</div>}
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
    </>)
}

export default LobbyInput;