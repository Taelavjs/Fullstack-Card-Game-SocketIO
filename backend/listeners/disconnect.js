
const disconnect = (socket, io) => {
    socket.on("disconnect", (reason) => {
        console.log(`disconnect ${socket.id} due to ${reason}`);
    });
}

module.exports = {
    disconnect,
}