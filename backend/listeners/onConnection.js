const onConnection = (sessionStore, socket) => {
  if (sessionStore.get(socket.handshake.auth.sessionID.toString())) {
    let playerRetrievedRecord = sessionStore.get(socket.handshake.auth.sessionID.toString());
    playerRetrievedRecord.socketId = socket.id;
    return true;
  }
  sessionStore.set(
    socket.handshake.auth.sessionID.toString(), {
    'userID': socket.userID,
    'username': socket.username,
    'socketId': socket.id,
    'activeRoom': null,
  }
  );
  return false;
}

module.exports = {
  onConnection,
}