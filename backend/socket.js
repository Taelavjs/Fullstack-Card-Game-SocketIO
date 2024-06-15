const { promiseHooks } = require("v8");
const { instrument } = require("@socket.io/admin-ui");

let io;
module.exports = {
    init: function(server) {
        return new Promise((resolve) => {
            const httpServer = require("http").createServer();
            io = require("socket.io")(httpServer, {
            cors: {
                origin: ["http://localhost:8080", "https://admin.socket.io"],
            }});
            instrument(io, {
                auth: false,
                mode: "development",
              });
              
            resolve(io);
        })

    },
    getio: function() {
        // return previously cached value
        if (!io) {
            throw new Error("must call .init(server) before you can call .getio()");
        }
        return io;
    }
}
