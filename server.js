var http = require('http');
var path = require('path');
var ejs = require('ejs');
var socketio = require('socket.io');
var express = require('express');

var router = express();
var server = http.createServer(router);
var io = new socketio.Server(server, {
  // Optimize Socket.IO settings
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 10000,
  maxHttpBufferSize: 1e6,
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

var connectedUsers = new Map();
var activeCursors = new Map();
var lastBroadcast = 0;
var BROADCAST_INTERVAL = 16; // ~60 FPS (16ms)

router.set("view engine", "ejs");
router.use(express.static("public"));

router.use(express.static(path.resolve(__dirname, 'client')));


io.on('connection', function(socket) {
  console.log('User connected:', socket.id);
  
  // Generate user data
  const userId = socket.id;
  const userColor = {
    r: Math.floor(Math.random() * 255),
    g: Math.floor(Math.random() * 255),
    b: Math.floor(Math.random() * 255)
  };
  
  // Store user info
  connectedUsers.set(userId, {
    id: userId,
    color: userColor,
    lastActivity: Date.now()
  });

  socket.on('clientEvent', function(data) {
    console.log("User joined:", userId);
    
    // Send user their ID and color
    socket.emit('setusernum', { userId: userId });
    socket.emit("colorset", userColor);
    
    // Send current user count to all clients
    io.emit('userCount', { count: connectedUsers.size });
  });

  socket.on('cursor', function(data) {
    if (data && typeof data.x === 'number' && typeof data.y === 'number') {
      const user = connectedUsers.get(userId);
      if (user) {
        activeCursors.set(userId, {
          x: data.x,
          y: data.y,
          ...user.color,
          userId: userId,
          timestamp: Date.now()
        });
        user.lastActivity = Date.now();
        
        // Throttled broadcast - only if enough time has passed
        const now = Date.now();
        if (now - lastBroadcast > BROADCAST_INTERVAL) {
          broadcastCursors();
          lastBroadcast = now;
        }
      }
    }
  });

  socket.on('removeCursor', function(data) {
    activeCursors.delete(userId);
    broadcastCursors();
  });

  socket.on('disconnect', function() {
    console.log('User disconnected:', userId);
    connectedUsers.delete(userId);
    activeCursors.delete(userId);
    broadcastCursors();
    
    // Send updated user count to all clients
    io.emit('userCount', { count: connectedUsers.size });
  });
});


server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
  var addr = server.address();
  console.log("Server listening at", addr.address + ":" + addr.port);
});

// Optimized broadcast function
function broadcastCursors() {
  if (activeCursors.size > 0) {
    const cursorsArray = Array.from(activeCursors.values());
    io.emit('broadcast', { cursors: cursorsArray });
  }
  
  // Also send user count
  io.emit('userCount', { count: connectedUsers.size });
}

// Clean up inactive cursors periodically
setInterval(() => {
  const now = Date.now();
  const TIMEOUT = 30000; // 30 seconds
  
  for (const [userId, user] of connectedUsers.entries()) {
    if (now - user.lastActivity > TIMEOUT) {
      console.log('Cleaning up inactive user:', userId);
      connectedUsers.delete(userId);
      activeCursors.delete(userId);
    }
  }
}, 10000); // Check every 10 seconds

router.get("/", function(req, res){
    res.render("index");
});