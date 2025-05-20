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
  },
});

const port = 3000;

app.get("/", (req, res) => {
  res.send("hi");
});

io.on("connection", (socket) => {
  console.log("User connected " + socket.id);

  socket.on("message", ({ msg, roomId }) => {
    console.log(msg + " from " + socket.id);

    console.log(roomId);
    io.to(roomId).emit("receive-msg", { msg, socketId: socket.id });
  });
  socket.on("typing", ({ roomId, user }) => {
    socket.to(roomId).emit("show_typing", { user }); // Tell others in room
  });
  socket.on("stop_typing", ({ roomId }) => {
    socket.to(roomId).emit("hide_typing"); // Tell others to remove typing
  });
  socket.on("specific-id", ({ msg, room }) => {
    socket.to(room).emit("receive-msg", { msg });
  });
  socket.on("join_room", ({ roomId }) => {
    console.log(roomId);
    socket.join(roomId);
  });

  socket.on("disconnect", () => {
    console.log("User disconneted");
  });
});

server.listen(port, () => {
  console.log("Server is running on port " + port);
});
