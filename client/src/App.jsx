import React, { useMemo, useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  Container,
  TextField,
  Typography,
  Button,
  Box,
  Stack,
  Paper,
} from "@mui/material";

function App() {
  const socket = useMemo(() => io("http://localhost:3000"), []);

  const [msg, setmsg] = useState("");
  const [room, setRoom] = useState("");
  const [socketid, setSocketid] = useState("");
  const [messages, setMessages] = useState(["ronak", "kriplani"]);
  const [roomid, setRoomid] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("message", { msg, roomid });
    setmsg("");
  };
  const SubmitHandler=(e)=>{
    e.preventDefault();
    socket.emit("specific-id",{msg,room});
  }

  const joinHandler = (e) => {
    e.preventDefault();
    socket.emit("join_room", { roomid });
  };

  useEffect(() => {
    socket.on("connect", () => {
      setSocketid(socket.id);
      console.log("connected", socket.id);
    });

    socket.on("receive-msg", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
      console.log(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h3" gutterBottom align="center">
        Welcome to Socket.io
      </Typography>

      <Typography variant="subtitle1" gutterBottom align="center">
        Your Socket ID: <strong>{socketid}</strong>
      </Typography>

      <Box component="form" onSubmit={joinHandler} sx={{ mt: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            value={roomid}
            onChange={(e) => setRoomid(e.target.value)}
            label="Room ID"
            variant="outlined"
            fullWidth
          />
          <Button type="submit" variant="contained" color="primary">
            Join Room
          </Button>
        </Stack>
      </Box>

      {roomid && (
        <Typography sx={{ mt: 2 }}>
          ✅ Joined room: <strong>{roomid}</strong>
        </Typography>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <Stack spacing={2}>
          <TextField
            value={msg}
            onChange={(e) => setmsg(e.target.value)}
            label="Message"
            variant="outlined"
            fullWidth
          />
        
          <Button type="submit" variant="contained" color="secondary">
            Send Message
          </Button>
           
        </Stack>
      </Box>


      <Box component="form" onSubmit={SubmitHandler} sx={{ mt: 4 }}>
        <Stack spacing={2}>
          <TextField
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            label="Enter Room_id of Specefic person"
            variant="outlined"
            fullWidth
          />
          <Button type="submit" variant="contained" >
            Send Message
          </Button>
         
        </Stack>
      </Box>

      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" gutterBottom>
          Messages
        </Typography>
        <Stack spacing={1}>
          {messages.map((msg, index) => (
            <Paper key={index} sx={{ p: 1.5 }}>
              {msg}
            </Paper>
          ))}
        </Stack>
      </Box>
    </Container>
  );
}

export default App;
