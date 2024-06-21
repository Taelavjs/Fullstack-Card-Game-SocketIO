import { useEffect, useState } from 'react';
import UsernameComponent from './components/usernameComponent';
import MatchMaking from './pages/matchMaking';
import socket from './socket';
import { createContext } from "react";
import ReactDOM from "react-dom/client";

export const UserContext = createContext({});

function App() {
  const [sessionID, setSessionId] = useState(sessionStorage.getItem("sessionId"));
  const [userID, setUserID] = useState(sessionStorage.getItem("userID"));
  const [reconnectObjectState, setReconnectObjectState] = useState({});
  const [isConnected, setIsConnected] = useState(true);
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
      console.log(socket);
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

    // Cleanup on component unmount
    return () => {
      socket.off('connect');
      socket.off('reconnected-room');
      socket.off('session');
    };
  }, []);

  return (
    <>
      {isLostSession && sessionID == null &&
        <div className='absolute w-screen top-0 left-0 h-1.5 bg-yellow-200 text-yellow-800 border border-yellow-400 px-2 py-1 rounded-lg shadow-sm'>
  ERR
</div>      }
      {userID == null && sessionID == null && <UsernameComponent sessionId={sessionID} setSessionId={setSessionId} userID={userID} setUserID={setUserID} />}
      <UserContext.Provider value={reconnectObjectState}>
        <MatchMaking />
      </UserContext.Provider>
      {sessionID != null && ( // Show loading overlay when in loading state
        <div className={`w-screen h-screen absolute top-0 left-0 flex items-center justify-center bg-gradient-to-r from-red-500 via-yellow-500 to-purple-500 transition-opacity duration-1000 ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
          <div className='text-white text-3xl font-bold animate-pulse'>Loading...</div>
        </div>
      )}
    </>
  );
}

export default App;
