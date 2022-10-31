import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";

const app = express();

const server = http.createServer(app);

const io = new Server(server);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});

io.on("connection", async (socket) => {
  io.emit("user connect");

  //   Sets User ID and Nickname
  var userNames = {};
  socket.on("setSocketId", function (data) {
    var userName = data.name;
    var userId = data.userId;
    userNames[userName] = userId;
    console.log("Users object", userNames);
    console.log("user ", userName, "entered chat");
    io.emit("user entered chat", userName);
  });

  //   Handles chat message and attaches username to it
  socket.on("chat message", (msgDataArray) => {
    console.log("message: " + msgDataArray[0]);
    const userName = Object.keys(userNames).find(
      (key) => userNames[key] === msgDataArray[1]
    );
    const msgResponseDataArray = [msgDataArray[0], userName];
    io.emit("chat message", msgResponseDataArray);
  });

  //   Handles user disconnect
  socket.on("disconnect", () => {
    io.emit("user disconnect");
    console.log("a user disconnected");
  });
});

server.listen(3000, () => {
  console.log("Listening on *:3000");
});
