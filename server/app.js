import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";

const app = express();
const server = createServer(app);

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins or replace with frontend URL like "http://localhost:3000"
    methods: ["GET", "POST"],
  }
});

const port = 3000;

app.get("/", (req, res) => {
  res.send("hi");
});

io.on("connection", (socket) => {
  console.log("User connected " +socket.id);

  socket.on("message",({msg,roomid})=>{
    console.log(msg + " from " + socket.id)
   
    io.to(roomid).emit("receive-msg", { msg, socketId: socket.id });
  })

  socket.on("specific-id",({msg,room})=>{
    socket.to(room).emit("receive-msg",{msg})
     
  })
  socket.on("join_room",({roomid})=>{
    console.log(roomid)
    socket.join(roomid);
  })

  socket.on("disconnect",()=>{
    console.log("User disconneted")
  })

});

server.listen(port, () => {
  console.log("Server is running on port " + port);
});
