const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs');

// 设置全局编码为UTF-8，确保正确处理中文
process.env.LANG = 'zh_CN.UTF-8';

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
    // 处理中文文件名：保存原始名称的Buffer编码
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(originalName));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 3 * 1024 * 1024 * 1024, // 3GB limit
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
    name: req.body.roomName || 'Untitled Planet',
    theme: req.body.roomTheme || 'General',
    createdAt: new Date(),
    viewers: [],
    videoInfo: null,
    chatMessages: [],
    playbackState: {
      isPlaying: false,
      currentTime: 0,
      lastUpdated: Date.now()
    }
  };
  
  res.status(201).json({ 
    success: true, 
    roomId, 
    roomName: rooms[roomId].name,
    roomTheme: rooms[roomId].theme,
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

// Add new endpoint to get all active rooms
app.get('/api/rooms', (req, res) => {
  const activeRooms = Object.values(rooms).map(room => ({
    id: room.id,
    name: room.name,
    theme: room.theme,
    host: room.host,
    createdAt: room.createdAt,
    viewerCount: room.viewers.length,
    hasVideo: !!room.videoInfo
  }));
  
  res.status(200).json({
    success: true,
    count: activeRooms.length,
    rooms: activeRooms
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
  
  // 处理中文文件名：将原始文件名从latin1转换为utf8
  const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
  
  const videoInfo = {
    fileName: req.file.filename,
    originalName: originalName,
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
  socket.on('joinRoom', ({ roomId, userName, visitorId }) => {
    if (!rooms[roomId]) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    // Store visitorId in socket for reference
    socket.visitorId = visitorId;
    socket.userName = userName; // 保存用户名到socket对象
    
    // Check if this user is already in the room (page refresh case)
    const existingViewerIndex = rooms[roomId].viewers.findIndex(v => v.visitorId === visitorId);
    
    if (existingViewerIndex !== -1) {
      // Update existing viewer's socket ID
      const existingViewer = rooms[roomId].viewers[existingViewerIndex];
      console.log(`Visitor ${visitorId} (${userName}) reconnected, replacing socket ${existingViewer.id} with ${socket.id}`);
      
      // Update the socket ID but keep the visitor ID and name
      existingViewer.id = socket.id;
      
      // 更新用户名（如果发生了变化）
      if (existingViewer.name !== userName) {
        const oldName = existingViewer.name;
        existingViewer.name = userName;
        
        // 创建系统消息记录用户名变更
        const systemMessage = {
          id: Date.now(),
          sender: 'System',
          message: `${oldName} 重新连接为 ${userName}`,
          timestamp: new Date(),
          isSystem: true
        };
        
        // 将系统消息添加到聊天记录
        if (!rooms[roomId].chatMessages) {
          rooms[roomId].chatMessages = [];
        }
        rooms[roomId].chatMessages.push(systemMessage);
        
        // 广播系统消息
        io.to(roomId).emit('newChatMessage', systemMessage);
      }
      
      // Add to socket.io room
      socket.join(roomId);
      
      // Send current room state to the reconnected user
      socket.emit('roomState', rooms[roomId]);
      
      return;
    }
    
    // Add to room (new user)
    socket.join(roomId);
    
    const viewer = {
      id: socket.id,
      visitorId: visitorId, // Store the visitor ID
      name: userName || 'Anonymous',
      joinedAt: new Date()
    };
    
    rooms[roomId].viewers.push(viewer);
    
    // Send current room state to the new user
    socket.emit('roomState', rooms[roomId]);
    
    // 创建系统消息通知有新用户加入
    const joinMessage = {
      id: Date.now(),
      sender: 'System',
      message: `${userName} 加入了房间`,
      timestamp: new Date(),
      isSystem: true
    };
    
    // 将系统消息添加到聊天记录
    if (!rooms[roomId].chatMessages) {
      rooms[roomId].chatMessages = [];
    }
    rooms[roomId].chatMessages.push(joinMessage);
    
    // Broadcast to others in the room
    socket.to(roomId).emit('userJoined', viewer);
    
    // 向所有人广播加入消息
    io.to(roomId).emit('newChatMessage', joinMessage);
    
    console.log(`${viewer.name} (${visitorId}) joined room ${roomId}`);
  });
  
  // 添加处理用户改名事件
  socket.on('userNameChanged', ({ roomId, oldUserName, newUserName }) => {
    if (!rooms[roomId]) return;
    
    // 查找该用户在房间中的记录
    const viewerIndex = rooms[roomId].viewers.findIndex(v => v.id === socket.id);
    
    if (viewerIndex !== -1) {
      // 更新用户名
      rooms[roomId].viewers[viewerIndex].name = newUserName;
      
      // 创建系统消息记录用户名变更
      const systemMessage = {
        id: Date.now(),
        sender: 'System',
        message: `${oldUserName} 修改名称为 ${newUserName}`,
        timestamp: new Date(),
        isSystem: true
      };
      
      // 将系统消息添加到聊天记录
      if (!rooms[roomId].chatMessages) {
        rooms[roomId].chatMessages = [];
      }
      rooms[roomId].chatMessages.push(systemMessage);
      
      // 通知房间内所有人用户改名了
      io.to(roomId).emit('userNameChanged', {
        socketId: socket.id,
        oldName: oldUserName,
        newName: newUserName
      });
      
      // 广播系统消息
      io.to(roomId).emit('newChatMessage', systemMessage);
      
      console.log(`User ${socket.id} changed name from ${oldUserName} to ${newUserName} in room ${roomId}`);
    }
  });
  
  // Handle playback control events
  socket.on('playbackControl', ({ roomId, action, currentTime, isPlaying }) => {
    if (!rooms[roomId]) return;
    
    const now = Date.now();
    
    // Always use the explicit isPlaying parameter if provided
    const newPlaybackState = {
      isPlaying: isPlaying !== undefined ? isPlaying : (action === 'play' ? true : action === 'pause' ? false : rooms[roomId].playbackState.isPlaying),
      currentTime: currentTime || rooms[roomId].playbackState.currentTime,
      lastUpdated: now
    };
    
    // Update room state with new playback information
    rooms[roomId].playbackState = newPlaybackState;
    
    // Broadcast the playback state change to all clients in the room
    io.to(roomId).emit('playbackUpdate', {
      action,
      currentTime: newPlaybackState.currentTime,
      isPlaying: newPlaybackState.isPlaying,
      initiator: socket.id
    });
  });
  
  // Handle chat messages
  socket.on('chatMessage', ({ roomId, message, sender, visitorId }) => {
    if (!rooms[roomId]) return;
    
    const chatMessage = {
      id: Date.now(),
      sender: sender || 'Anonymous',
      visitorId: visitorId || socket.visitorId,
      message,
      timestamp: new Date()
    };
    
    // 保存聊天记录到房间对象中
    if (!rooms[roomId].chatMessages) {
      rooms[roomId].chatMessages = [];
    }
    rooms[roomId].chatMessages.push(chatMessage);
    
    // 限制历史消息数量，保留最近的500条
    if (rooms[roomId].chatMessages.length > 500) {
      rooms[roomId].chatMessages = rooms[roomId].chatMessages.slice(-500);
    }
    
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
      
      // If the socket had a visitorId, check that no other socket is using the same visitorId
      // before removing the viewer
      if (socket.visitorId) {
        // Check if there are other active sockets with the same visitorId
        const hasOtherConnection = Array.from(io.sockets.sockets.values()).some(s => 
          s.id !== socket.id && s.visitorId === socket.visitorId && s.rooms?.has(roomId)
        );
        
        if (hasOtherConnection) {
          console.log(`User ${socket.visitorId} has other active connections, not removing from viewers`);
          return; // Skip removing this user
        }
      }
      
      // Find viewer by socket ID
      const viewerIndex = room.viewers.findIndex(v => v.id === socket.id);
      
      if (viewerIndex !== -1) {
        const viewer = room.viewers[viewerIndex];
        room.viewers.splice(viewerIndex, 1);
        
        // Notify others
        socket.to(roomId).emit('userLeft', { 
          id: socket.id, 
          visitorId: viewer.visitorId,
          name: viewer.name 
        });
        
        console.log(`${viewer.name} (${viewer.visitorId}) left room ${roomId}`);
      }
    });
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 