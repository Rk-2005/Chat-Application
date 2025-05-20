import React, { useMemo, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import {
  Container,
  TextField,
  Typography,
  Button,
  Box,
  Stack,
  Paper,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Send as SendIcon,
  MeetingRoom as RoomIcon,
  Person as PersonIcon,
  Message as MessageIcon,
  Chat as ChatIcon,
} from "@mui/icons-material";

function App() {
  const socket = useMemo(
    () => io("https://chat-application-xrmj.onrender.com/"),
    []
  );
 // const socket = useMemo(() => io("http://localhost:3000/"), []);
  const messageInputRef = useRef(null);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [Createdid, setCreatedid] = useState("");
  const [msg, setMsg] = useState("");
  const messagesEndRef = useRef(null);

  const [room, setRoom] = useState("");
  const [socketId, setSocketId] = useState("");
  const [messages, setMessages] = useState([
    {
      msg: "Welcome to Socket.io Chat! 🚀",
      socketId: "1",
      isCurrentUser: false,
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      msg: "To start chatting, create a room and share the Room ID with a friend. 💬",
      socketId: "2",
      isCurrentUser: false,
      timestamp: new Date(Date.now() - 1800000),
    },
  ]);
  useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]); // assuming 'messages' is your message array

  const [isJoined, setisJoined] = useState(0);
  const [roomId, setRoomId] = useState("");
  const [activeTab, setActiveTab] = useState("general");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
socket.emit("stop_typing", {roomId });
    socket.emit("message", { msg, roomId });
    setMsg("");
    // setMessages((prev) => [...prev, newMessage]);
     // Don't add to messages list here
  };

  const handlePrivateSubmit = (e) => {
    e.preventDefault();
    if (!msg.trim() || !room.trim()) return;

    const newMessage = {
      msg,
      socketId,
      isCurrentUser: true,
      timestamp: new Date(),
      isPrivate: true,
      recipient: room,
    };

    socket.emit("specific-id", { msg, room });
    setMessages((prev) => [...prev, newMessage]);
    setMsg("");
    setRoom("");
  };
  const handleJoin = (e) => {
    e.preventDefault();
    setisJoined(1);
  };
  const joinHandler = (e) => {
    e.preventDefault();
    if (!roomId.trim()) return;
    socket.emit("join_room", { roomId });
    setisJoined(1); // <- This was missing
  };

  useEffect(() => {
    socket.on("connect", () => {
      setSocketId(socket.id);
      console.log("connected", socket.id);
    });

    socket.on("receive-msg", (data) => {
      console.log("hi");
      setMessages((prev) => [
        ...prev,
        {
          msg: data.msg,
          socketId: data.socketId,
          isCurrentUser: data.socketId === socket.id, // determine ownership here
          timestamp: new Date(),
        },
      ]);
    });
    const typingIndicator = document.getElementById("typingIndicator");
    socket.on("show_typing", ({ user }) => {
      typingIndicator.innerText = `${user} is typing...`;
    });

    socket.on("hide_typing", () => {
      typingIndicator.innerText = "";
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
  if (msg.trim()) {
    socket.emit("typing", { roomId, user: socket.id });
    const timeout = setTimeout(() => {
      socket.emit("stop_typing", { roomId });
    }, 1000);
    
    return () => clearTimeout(timeout);
  }
}, [msg, roomId, socket]);


  const createid = (e) => {
    e.preventDefault();
    const no = parseInt(Math.random() * 1000000000);
    setCreatedid(no);
    setRoomId(no.toString()); // Set roomId so the user joins it
    socket.emit("join_room", { roomId: no.toString() });
    setisJoined(1); // Mark as joined
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: 4,
        mb: 4,
        p: isMobile ? 1 : 3,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: theme.shadows[3],
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 3,
          p: 2,
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          borderRadius: 1,
        }}
      >
        <ChatIcon sx={{ mr: 2, fontSize: 32 }} />
        <Typography variant="h4" component="h1">
          Socket.io Chat
        </Typography>
        <Chip
          label={`ID: ${socketId || "connecting..."}`}
          size="small"
          sx={{
            ml: "auto",
            backgroundColor: theme.palette.primary.dark,
            color: theme.palette.primary.contrastText,
          }}
          icon={<PersonIcon fontSize="small" />}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 3,
          height: "70vh",
        }}
      >
        {/* Left sidebar */}
        <Box
          sx={{
            width: isMobile ? "100%" : 250,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Generate Room_id
            </Typography>
            <Box component="form" onSubmit={createid}>
              <Stack spacing={1}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<RoomIcon />}
                  fullWidth
                >
                  Generate
                </Button>
              </Stack>
            </Box>
            {Createdid && (
              <Chip
                label={`Joined: ${Createdid}`}
                color="success"
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Join Room
            </Typography>
            <Box component="form" onSubmit={joinHandler}>
              <Stack spacing={1}>
                <TextField
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  label="Room ID"
                  variant="outlined"
                  size="small"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <RoomIcon fontSize="small" sx={{ mr: 1 }} />
                    ),
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<RoomIcon />}
                  fullWidth
                >
                  Join
                </Button>
              </Stack>
            </Box>
            {roomId && isJoined === 1 && (
              <Chip
                label={`Joined: ${roomId}`}
                color="success"
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Direct Message
            </Typography>
            <Box component="form" onSubmit={handlePrivateSubmit}>
              <Stack spacing={1}>
                <TextField
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  label="Recipient ID"
                  variant="outlined"
                  size="small"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                    ),
                  }}
                />
                <TextField
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  label="Private Message"
                  variant="outlined"
                  size="small"
                  fullWidth
                  multiline
                  rows={2}
                />
                <Button
                  type="submit"
                  variant="outlined"
                  color="secondary"
                  startIcon={<SendIcon />}
                  fullWidth
                >
                  Send Private
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Box>

        {/* Main chat area */}
        <Paper
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            p: 0,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              p: 2,
              backgroundColor: theme.palette.grey[100],
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6">
              {activeTab === "general" ? "General Chat" : "Private Messages"}
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              p: 2,
              overflowY: "auto",
              backgroundColor: theme.palette.background.default,
            }}
          >
            
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  mb: 2,
                  display: "flex",
                  flexDirection: message.isCurrentUser ? "row-reverse" : "row",
                  alignItems: "flex-start",
                  gap: 1,
                }}
              >
                
                <Tooltip title={message.socketId}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: message.isCurrentUser
                        ? theme.palette.primary.main
                        : theme.palette.secondary.main,
                    }}
                  >
                    {message.socketId ? message.socketId.charAt(0) : "?"}
                  </Avatar>
                </Tooltip>
                <Paper
                  sx={{
                    p: 1.5,
                    maxWidth: "70%",
                    backgroundColor: message.isCurrentUser
                      ? theme.palette.primary.light
                      : theme.palette.grey[200],
                    color: message.isCurrentUser
                      ? theme.palette.primary.contrastText
                      : "inherit",
                    borderRadius: message.isCurrentUser
                      ? "18px 18px 0 18px"
                      : "18px 18px 18px 0",
                  }}
                >
                 <div ref={messagesEndRef} />


                  <Typography variant="body1">{message.msg}</Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      textAlign: "right",
                      color: message.isCurrentUser
                        ? theme.palette.primary.contrastText
                        : theme.palette.text.secondary,
                    }}
                  >
                    {formatTime(message.timestamp)}
                  </Typography>
                </Paper>
              </Box>
            ))}
            hi
            <div id="typingIndicator"></div>
          </Box>

          <Box
            sx={{
              p: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.grey[100],
            }}
          >
            <Box component="form" onSubmit={handleSubmit}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                 value={msg} 
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                 
                  id="messageInput"
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Type your message..."
                  //inputRef={messageInputRef} 
                  variant="outlined"
                  size="small"
                  fullWidth
                  multiline
                  maxRows={3}
                />
                <Tooltip title="Send message">
                  <IconButton
                    type="submit"
                    color="primary"
                    disabled={!msg.trim()}
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      "&:hover": {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default App;
