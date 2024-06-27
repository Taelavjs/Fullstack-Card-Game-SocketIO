const Session =require("../gameClasses/Session");

const onConnection = (sessionStore, socket) => {
  console.log("returned false lmao");

  if (sessionStore.get(socket.handshake.auth.sessionID.toString())) {
    console.log(sessionStore.get(socket.handshake.auth.sessionID.toString()));
    let playerRetrievedRecord = sessionStore.get(socket.handshake.auth.sessionID.toString());
    playerRetrievedRecord.socketId = socket.id;
    return true;
  }
  sessionStore.set(
    socket.handshake.auth.sessionID.toString(), new Session(socket.userID, socket.username, socket.id, null));
  console.log("test test test");
  return false;
}

module.exports = {
  onConnection,
}