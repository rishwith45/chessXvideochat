class RoomManager {
  constructor() {
    this.rooms = new Map();
  }
  createRoom(user1, user2) {
    this.rooms.set(user1, user2);
    this.rooms.set(user2, user1);
    user1.emit("roomCreated");
    user2.emit("roomCreated");
    user2.emit("orient");
  }
  played(user, tomove) {
    const user2 = this.rooms.get(user);
    user2.emit("update", tomove);
  }
  offer(user, sdp) {
    const user2 = this.rooms.get(user);
    const data = {
      description: sdp.description,
      candidate: 0,
    };
    if (user2) {
      user2.emit("from-server", { data });
    }
  }
  offerIce(user, ice) {
    const user2 = this.rooms.get(user);
    const data = {
      description: 0,
      candidate: ice,
    };
    user2.emit("from-server", { data });
  }
  setoppname(user, name) {
    const user2 = this.rooms.get(user);
    user2.emit("opponent-name", name);
  }
  remove(user) {
    const user2 = this.rooms.get(user);
    if (user2) {
      user2.emit("left-game");
    }
    this.rooms.delete(user);
    this.rooms.delete(user2);
    console.log(this.rooms.size);
  }
  gameover(user, name) {
    const user2 = this.rooms.get(user);
    if (user2) {
      user2.emit("woncand", name);
    }
  }
}
module.exports = RoomManager;
