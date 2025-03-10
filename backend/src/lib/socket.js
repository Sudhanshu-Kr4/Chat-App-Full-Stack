import express from "express";
import {Server} from "socket.io";
import http from "http";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors:{
    origin:"http://localhost:5173",
    methods: ["GET", "POST"]
  },
})

export function getRecieverSocketId(userId){
  return userSocketMap[userId];
}

// used to store online user in this map (userID:socketId )
const userSocketMap = {}


io.on("connection", (socket) => {
  console.log("A user connected : ",socket.id);

  const userId = socket.handshake.query.userId;
  if(userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected : ", socket.id); 
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  })





  
})


export {io, server, app};




