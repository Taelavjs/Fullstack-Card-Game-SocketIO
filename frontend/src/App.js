import { useEffect, useState } from 'react';
import UsernameComponent from './components/usernameComponent';
import MatchMaking from './pages/matchMaking';
import socket from './socket';
import { createContext } from "react";

export const UserContext = createContext({});

function App() {
  const [sessionID, setSessionId] = useState(sessionStorage.getItem("sessionId"));
  const [userID, setUserID] = useState(sessionStorage.getItem("userID"));
  const [reconnectObjectState, setReconnectObjectState] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // New loading state
  const [isLostSession, setLostSession] = useState(false);

  useEffect(() => {
    if (sessionID) {
      socket.auth = { sessionID };
      socket.connect();
      console.log(socket);
    }
  }, [sessionID]);

  useEffect(() => {
    socket.on('connect', function () {
      setIsConnected(true);
      setReconnectObjectState({});
      // setTimeout(() => {
      //   // close the low-level connection and trigger a reconnection
      //   socket.io.engine.close();
      // }, Math.random() * 5000 + 1000);

      console.log(socket);
      socket.on("reconnected-room", (roomInformationObj) => {
        setReconnectObjectState(roomInformationObj);
        // Start fade-out transition
        setTimeout(() => setIsLoading(false), 1000);
      });
  
      socket.on('session', ({ sessionID, userID, username }) => {
        sessionStorage.setItem("sessionId", sessionID);
        sessionStorage.setItem("userID", userID);
        setSessionId(parseInt(sessionID)); // Parse to integer
        setUserID(parseInt(userID)); // Parse to integer
        setLostSession(false);
        // Start fade-out transition
        setTimeout(() => setIsLoading(false), 1000);
      });

    
    });

    
    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);

      if (err.message === "invalid session ID") {
        sessionStorage.removeItem("sessionId");
        sessionStorage.removeItem("userID");

        setSessionId(null);
        setUserID(null);
        setLostSession(true);
      }
    });

    socket.on("disconnect", (err) => {
      console.log("DISC : ", err);
      setIsConnected(false);
    })



    // Cleanup on component unmount
    return () => {
      socket.off('connect');
      socket.off('reconnected-room');
      socket.off('session');
      socket.off("connection-error");
    };
  }, [sessionID]);

  return (
    <>
      {!isConnected && sessionID !== null && !(userID == null && sessionID == null) &&
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-screen h-5 bg-red-500 text-white text-center z-50 flex items-center justify-center'>
          Connection Err
        </div>      
      }
      {isLostSession && sessionID == null &&
        <div className='absolute top-0 left-0 transform w-screen h-5 bg-red-500 text-white text-center z-50 flex items-center justify-center'>
          SERVER RESTARTED, APOLOGIES
        </div>      
      }
      {userID == null && sessionID == null && 
      <UsernameComponent sessionId={sessionID} setSessionId={setSessionId} userID={userID} setUserID={setUserID} />}
      <UserContext.Provider value={reconnectObjectState}>
      {userID != null && sessionID != null && <MatchMaking /> }
      </UserContext.Provider>
      {sessionID != null && ( // Show loading overlay when in loading state
        <div className={`w-screen h-screen absolute top-0 left-0 flex items-center justify-center bg-gradient-to-r from-red-500 via-yellow-500 to-purple-500 transition-opacity duration-1000 ${isLoading ? 'pointer-events-auto' : 'pointer-events-none'} ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
          <div className='text-white text-3xl font-bold animate-pulse'>Loading...</div>
        </div>
      )}
    </>
  );
}

export default App;
