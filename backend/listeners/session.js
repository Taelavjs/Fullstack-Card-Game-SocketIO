const session = (socket) => {
    socket.emit("session", {
        sessionID: socket.handshake.auth.sessionID,
        userID: socket.userID,
        username: socket.username,
    });
}

module.exports = {
    session,
}