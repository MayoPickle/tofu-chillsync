const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Room data storage (in-memory for simplicity)
const rooms = {};

// API Routes
app.post('/api/rooms', (req, res) => {
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  rooms[roomId] = {
    id: roomId,
    host: req.body.hostName || 'Anonymous',
    createdAt: new Date(),
    viewers: [],
    videoInfo: null,
    playbackState: {
      isPlaying: false,
      currentTime: 0,
      lastUpdated: Date.now()
    }
  };
  
  res.status(201).json({ 
    success: true, 
    roomId, 
    message: 'Room created successfully' 
  });
});

app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  
  if (!rooms[roomId]) {
    return res.status(404).json({ 
      success: false, 
      message: 'Room not found' 
    });
  }
  
  res.status(200).json({ 
    success: true, 
    room: rooms[roomId] 
  });
});

app.post('/api/rooms/:roomId/upload', upload.single('video'), (req, res) => {
  const { roomId } = req.params;
  
  if (!rooms[roomId]) {
    // Delete the uploaded file if room doesn't exist
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(404).json({ 
      success: false, 
      message: 'Room not found' 
    });
  }
  
  if (!req.file) {
    return res.status(400).json({ 
      success: false, 
      message: 'No video file uploaded' 
    });
  }
  
  const videoInfo = {
    fileName: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    path: `/uploads/${req.file.filename}`
  };
  
  rooms[roomId].videoInfo = videoInfo;
  
  // Reset playback state when new video is uploaded
  rooms[roomId].playbackState = {
    isPlaying: false,
    currentTime: 0,
    lastUpdated: Date.now()
  };
  
  // Notify clients in the room about the new video
  io.to(roomId).emit('videoUpdated', videoInfo);
  
  res.status(200).json({ 
    success: true, 
    videoInfo,
    message: 'Video uploaded successfully' 
  });
});

// Socket.io logic
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Join a room
  socket.on('joinRoom', ({ roomId, userName }) => {
    if (!rooms[roomId]) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    // Add to room
    socket.join(roomId);
    
    const viewer = {
      id: socket.id,
      name: userName || 'Anonymous',
      joinedAt: new Date()
    };
    
    rooms[roomId].viewers.push(viewer);
    
    // Send current room state to the new user
    socket.emit('roomState', rooms[roomId]);
    
    // Broadcast to others in the room
    socket.to(roomId).emit('userJoined', viewer);
    
    console.log(`${viewer.name} joined room ${roomId}`);
  });
  
  // Handle playback control events
  socket.on('playbackControl', ({ roomId, action, currentTime }) => {
    if (!rooms[roomId]) return;
    
    const now = Date.now();
    
    switch (action) {
      case 'play':
        rooms[roomId].playbackState = {
          isPlaying: true,
          currentTime: currentTime || rooms[roomId].playbackState.currentTime,
          lastUpdated: now
        };
        break;
      case 'pause':
        rooms[roomId].playbackState = {
          isPlaying: false,
          currentTime: currentTime || rooms[roomId].playbackState.currentTime,
          lastUpdated: now
        };
        break;
      case 'seek':
        rooms[roomId].playbackState = {
          isPlaying: rooms[roomId].playbackState.isPlaying,
          currentTime: currentTime,
          lastUpdated: now
        };
        break;
    }
    
    // Broadcast the playback state change to all clients in the room
    io.to(roomId).emit('playbackUpdate', {
      action,
      currentTime: rooms[roomId].playbackState.currentTime,
      isPlaying: rooms[roomId].playbackState.isPlaying,
      initiator: socket.id
    });
  });
  
  // Handle chat messages
  socket.on('chatMessage', ({ roomId, message, sender }) => {
    if (!rooms[roomId]) return;
    
    const chatMessage = {
      id: Date.now(),
      sender: sender || 'Anonymous',
      message,
      timestamp: new Date()
    };
    
    // Broadcast to all in the room
    io.to(roomId).emit('newChatMessage', chatMessage);
  });
  
  // Synchronize with host
  socket.on('requestSync', ({ roomId }) => {
    if (!rooms[roomId]) return;
    
    socket.emit('syncPlayback', rooms[roomId].playbackState);
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Remove user from all rooms they were in
    Object.keys(rooms).forEach(roomId => {
      const room = rooms[roomId];
      const viewerIndex = room.viewers.findIndex(v => v.id === socket.id);
      
      if (viewerIndex !== -1) {
        const viewer = room.viewers[viewerIndex];
        room.viewers.splice(viewerIndex, 1);
        
        // Notify others
        socket.to(roomId).emit('userLeft', { 
          id: socket.id, 
          name: viewer.name 
        });
        
        console.log(`${viewer.name} left room ${roomId}`);
      }
    });
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 