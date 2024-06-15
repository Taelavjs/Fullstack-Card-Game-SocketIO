let roomStore;
module.exports = {
    init: function () {
        roomStore = new Map();
        return roomStore;
    },
    getRoomStore: function () {
        // return previously cached value
        if (!roomStore) {
            throw new Error("must call .init() before you can call .getRoomStore()");
        }
        return roomStore;
    },
    setRoomStore: function (room, createdMatch) {
        roomStore.set(room, createdMatch);
        return roomStore;
    },
    getActiveRoom: (room) => {
        return roomStore.get(room);
    },
    removeActiveRoom: (room) => {
        roomStore.delete(room);
        return true;
    }
}
