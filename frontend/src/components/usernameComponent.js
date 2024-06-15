import './../App.css';
import { useEffect, useState } from 'react';
import socket from '../socket';

const UsernameComponent = ({ sessionId, setSessionId, userID, setUserID }) => {
    const [username, setUsername] = useState('');


    const onUsernameSubmission = (username) => {
        socket.auth = { username };
        socket.connect();
        console.log(socket);
    }

    useEffect(() => {






    }, []);

    return (
        <div className="h-screen min-h-screen flex justify-center">
            <div className="flex flex-col justify-center items-center content-around">
                <input className="border" type="text" value={username} onChange={e => setUsername(e.target.value)} />
                <button className="border" onClick={() => onUsernameSubmission(username)}>Click me!</button>
            </div>
        </div>
    );
}

export default UsernameComponent;
