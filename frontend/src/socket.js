import { io } from "socket.io-client";

const URL = "http://localhost:3000";
const socket = io(URL, {
    autoConnect: false,
    reconnectionDelay: 5000 // 1000 by default
}); // Disable autoConnect

export default socket;
