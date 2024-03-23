const RoomManager = require("./RoomManager");
class UserManager {
  constructor() {
    this.queue = [];
    this.roomManager = new RoomManager();
  }
  addUsers(user) {
    this.queue.push(user);
    this.init(user);
    this.makeOpponents();
  }
  makeOpponents() {
    if (this.queue.length < 2) return;
    const user1 = this.queue.pop();
    const user2 = this.queue.pop();
    //console.log("in makeop");
    console.log(user1.connected, " ", user2.connected);
    //console.log(user1.id, "  ", user2.id);
    if (user1.connected && user2.connected) {
      this.roomManager.createRoom(user1, user2);
      this.makeOpponents();
    }
  }
  removeUser(user) {
    this.roomManager.remove(user);
  }
  init(user) {
    user.on("played", (tomove) => {
      this.roomManager.played(user, tomove);
    });
    user.on("send-offer", (sdp) => {
      this.roomManager.offer(user, sdp);
    });
    user.on("sending-ice", (ice) => {
      this.roomManager.offerIce(user, ice);
    });
    user.on("myname", (name) => {
      this.roomManager.setoppname(user, name);
    });
    user.on("game-over", (name) => {
      this.roomManager.gameover(user, name);
    });
  }
}
module.exports = UserManager;
