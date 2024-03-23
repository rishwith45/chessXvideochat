const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors"); // Import CORS middleware
const UserManager = require("./UserManager");
const app = express();
const server = createServer(app);
const io = new Server(server);

// Enable CORS for all origins (you` can also specify specific origins if needed)
const userManager = new UserManager();
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  })
);

app.get("/", (req, res) => {
  res.send("Hello");
});

io.on("connection", (socket) => {
  userManager.addUsers(socket);
  socket.on("disconnect", () => {
    console.log(socket.id);
    userManager.removeUser(socket);
  });
});

server.listen(5000, () => {
  console.log("server running at http://localhost:5000");
});
