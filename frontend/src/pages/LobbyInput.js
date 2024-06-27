
import { useState } from "react";
import LobbySelector from "./lobbySelector";
const LobbyInput = ({setIsHost, setMatch, socket, setReadyStatus}) => {
    const [errText, setErrorText] = useState("");
    const [createLobbyInput, setCreateLobbyInput] = useState("");
    const [joinLobbyInput, setJoinLobbyInput] = useState("");
    
    const [listLobbys, setListLobbys] = useState([]);
    const [showLobbyStatus, setShowLobbyStatus] = useState(false);
    
    const onChangeJoin = event => {
        setJoinLobbyInput(event.target.value);
    };

    const onChangeCreate = event => {
      setCreateLobbyInput(event.target.value);
    };
    
    const joinLobbys = (roomName) => {
        setShowLobbyStatus(false);
        console.log("attempt");
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
            setReadyStatus(false);

            console.log("PLAYERS IN ROOM ", players);
          })
        })
      }

    const joinLobby = (e) => {
        socket.emit("join-room", joinLobbyInput, (values) => {
          console.log("JOINGED ROOM RETURNED : ", values);
    
          if (values !== false) {
            setMatch(values);
          }
    
          socket.on("player-joined", (players) => {
            setMatch(players);
            setReadyStatus(false);
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
        socket.emit("create-room", createLobbyInput, cb => {
          if (!cb) {
            console.log("CREATED ROOM INSUCCESSFULLY");
            setErrorText("Invalid Lobby Id");
            return;
          }
          console.log("CREATED ROOM ", createLobbyInput);
          setIsHost(true);
          setMatch(cb);
    
          socket.on("player-joined", (players) => {
            console.log("Player-joined registered");
            setMatch(players);
            setReadyStatus(false);
            console.log("PLAYERS IN ROOM ", players);
          })
    
        });
    
      }

    return (
    
    <>
<div className="relative h-full w-full bg-gradient-to-r from-pastel-blue via-pastel-pink to-pastel-purple overflow-hidden flex flex-col justify-center items-center space-y-4">
    <div className="">
        <button
            className="bg-pastel-pink min-w-fit text-white px-6 py-3 rounded-none hover:bg-pastel-pink-dark transition duration-300 shadow-lg transform hover:-translate-y-1 hover:scale-105"
            onClick={showLobbys}
        >
            View Open Lobbies
        </button>
    </div>
    <div className="w-full h-min flex flex-col items-center justify-evenly">
        <input
            type="text"
            className=" border min-w-full border-gray-300 rounded-none px-4 py-3 bg-pastel-blue-light shadow-lg w-3/4"
            onChange={onChangeCreate}
            placeholder="Lobby Name"
        />
        <button
            className="truncate min-w-fit min-h-fit bg-pastel-blue text-white px-6 py-3 ml-3 w-1/4 rounded-none hover:bg-pastel-blue-dark transition duration-300 shadow-lg transform hover:-translate-y-1 hover:scale-105"
            onClick={createLobby}
        >
            Create
        </button>
    </div>
    <div className="w-full h-min flex flex-col items-center justify-evenly">
        <input
            type="text"
            className="border min-w-full border-gray-300 rounded-none px-4 py-3 bg-pastel-pink-light shadow-lg w-3/4"
            onChange={onChangeJoin}
            placeholder="Lobby Code"
        />
        <button
            className="truncate min-w-fit min-h-fit bg-pastel-blue text-white px-6 py-3 ml-3 w-1/4 rounded-none hover:bg-pastel-blue-dark transition duration-300 shadow-lg transform hover:-translate-y-1 hover:scale-105"
            onClick={joinLobby}
        >
            Join {socket.connected ? '' : 'Disconnected'}
        </button>
    </div>
    {errText && <div className="absolute top-2/3 left-1/4 w-1/2 text-center text-pastel-red">{errText}</div>}
</div>




        <div className={`fixed top-0 left-0 mr-auto ml-auto self-center w-4/6 ${showLobbyStatus ? 'slide-in' : 'slide-out'}`}>
        <div className="w-screen h-screen zBackClick" onClick={showLobbys}>
        <div className="gridList">
          <div className="cellList heading">Lobby Name</div>
          <div className="cellList heading">Host Name</div>
          <div className="cellList heading">Player Count</div>

        {listLobbys?.map((lobbyInfo, index) => (
            <LobbySelector
            key={index}
            roomInfo={lobbyInfo}
            setRoomName={() => joinLobbys(lobbyInfo.roomTitle)}
            />
        ))}
        </div>
        </div>
    </div>
    </>)
}

export default LobbyInput;