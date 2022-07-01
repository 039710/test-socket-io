require('dotenv').config();
const express = require('express');
const port = process.env.PORT || 3001;
const app = express();
const cors = require('cors');
const socket = require('socket.io');
const session = require("express-session")
const sessionMiddleware = session({
  secret: "secret",
  resave: false,
  saveUninitialized: false,
})
app.use(cors());
app.use(sessionMiddleware)


const http = require('http').createServer(app);
const rooms = {}
http.listen(port, () => {
  console.log(`listening on port ${port}`);
})
const io = socket(http,{
  cors: {
    origin: '*',
  }
})


io.on('connection', (socket) => {

  console.log('socket connection established');
  socket.on("joinRoom", ({ user, roomsId }) => {
    socket.join(roomsId);
  });
  socket.on("leaveRoom", ({ user, roomId  } ) => {

  });
  socket.on('sendMessage', ({ user, message, roomsId }) => {
    console.log('user => ' + user + ", send => " + message + " socket id" + socket.id + " Room : ", roomsId);
    socket.in(roomsId).emit('new message', ({ user, message, roomsId }))
  });
  socket.on('error', (err) => {
    console.log(err);
  });

  socket.on('connect_error', function (err) {
    console.log("connect failed" + err);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});