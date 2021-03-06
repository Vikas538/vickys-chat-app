const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/message.js");

const { addUser, getUser, getUsersInRoom, removeUser } = require("./utils/user");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {



  socket.on("newMsg", (msg, callback) => {
    const filter = new Filter();
    if (filter.isProfane(msg)) {
      return callback("bad boy");
    }
    const user = getUser(socket.id);
    if (user) io.to(user.room).emit("message", generateMessage(user.username,msg));

    callback();
  });

  socket.on('sendLocation', (coords, callback) => {
    const user=getUser(socket.id)
    if(user)
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    callback()
})

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage('Admin',`${user.username} has left the chat room`)
      );
      io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUsersInRoom(user.room)
      })
    }
  });

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit("message", generateMessage("welcome!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage(`${user.username} has joined the chat room!`)
      );
      io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUsersInRoom(user.room)
      })
    callback();
  });
});

server.listen(port, () => {
  console.log("listening at port " + port);
});
