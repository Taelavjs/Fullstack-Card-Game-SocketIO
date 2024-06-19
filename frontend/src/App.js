import { useEffect, useState } from 'react';
import UsernameComponent from './components/usernameComponent';
import MatchMaking from './components/matchMaking';
import socket from './socket';
import { createContext } from "react";
import ReactDOM from "react-dom/client";

export const UserContext = createContext({});

function App() {

  const [sessionID, setSessionId] = useState(sessionStorage.getItem("sessionId"));
  const [userID, setUserID] = useState(sessionStorage.getItem("userID"));
  const [reconnectObjectState, setReconnectObjectState] = useState({});
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    if (sessionID) {
      socket.auth = { sessionID };
      socket.connect();
      console.log(socket);
    }


  }, []);


  useEffect(() => {
    socket.on('connect', function () {
      console.log(socket);

      // setTimeout(() => {
      //   // close the low-level connection and trigger a reconnection
      //   console.log("rans");
      //   setIsConnected(socket.connected);
      //   socket.io.engine.close();
      // }, Math.random() * 5000 + 1000);

    });
    socket.on("reconnected-room", (roomInformationObj) => {
      console.log(roomInformationObj);
      console.log("ran");
      setReconnectObjectState(roomInformationObj);

    })
  }, [])

  socket.on('session', ({ sessionID, userID, username }) => {
    sessionStorage.setItem("sessionId", sessionID);
    sessionStorage.setItem("userID", userID);
    setSessionId(parseInt(sessionID)); // Parse to integer
    setUserID(parseInt(userID)); // Parse to integer
  });




  return (
    <>
      <div id="sticky-banner" tabIndex="-1" className="top-0 start-0 z-50 flex justify-between w-full p-4 border-b border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
        <div className='flex items-center'>
          {isConnected ? 'Connected' : 'Disconnected'}

        </div>
      </div>
      {userID == null && sessionID == null && <UsernameComponent sessionId={sessionID} setSessionId={setSessionId} userID={userID} setUserID={setUserID} />}
      <UserContext.Provider value={reconnectObjectState}>
        {<MatchMaking />}
      </UserContext.Provider>
    </>
  );
}

export default App;
