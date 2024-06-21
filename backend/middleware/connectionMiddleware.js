const io = require('../socket').getio();
const { randomInt } = require('../utility/utility.js');

module.exports = (sessionStore) => {
  io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    const sessionID = socket.handshake.auth.sessionID;
    console.log("MIDDLEWARE");
    if (!username && !sessionID) {
      return next(new Error("invalid username"));
    }

    next();
  });

  io.use((socket, next) => {

    const sessionID = socket.handshake.auth.sessionID;
    if (sessionID) {
      // find existing session
      const session = sessionStore.get(String(sessionID));
      if (session) {
        socket.sessionID = sessionID;
        socket.userID = session.userID;
        socket.username = session.username;
        return next();
      } else {
        console.log("invalid session ID");
        console.log("SESSION ID : ", "" + sessionID);
        console.log(sessionStore);
        console.log(session);
        
        return next(new Error("invalid session ID"));

      }
    }
    const username = socket.handshake.auth.username;
    if (!username) {
      return next(new Error("invalid username"));
    }
    // create new session
    socket.handshake.auth.sessionID = randomInt(70000000);
    socket.userID = randomInt(70000000);
    socket.username = username;
    next();
  });
}