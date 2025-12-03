const { Server } = require('socket.io');
const redisService = require('./redisService');

let io;

/**
 * Khởi tạo Socket.IO server
 */
function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log('✓ Client connected:', socket.id);

    // Gửi tất cả vị trí xe hiện tại khi client kết nối
    redisService.getAllBusLocations().then((locations) => {
      if (locations.length > 0) {
        socket.emit('bus:locations', locations);
        console.log(`Sent ${locations.length} bus locations to client ${socket.id}`);
      }
    }).catch(err => {
      console.error('Error fetching bus locations:', err);
    });

    // Client yêu cầu refresh tất cả locations
    socket.on('bus:requestAll', async () => {
      try {
        const locations = await redisService.getAllBusLocations();
        socket.emit('bus:locations', locations);
      } catch (err) {
        console.error('Error handling bus:requestAll:', err);
      }
    });

    // Client yêu cầu location của 1 xe cụ thể
    socket.on('bus:request', async (data) => {
      try {
        const { busId } = data;
        const location = await redisService.getBusLocation(busId);
        if (location) {
          socket.emit('bus:location', location);
        }
      } catch (err) {
        console.error('Error handling bus:request:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('✗ Client disconnected:', socket.id);
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });
  });

  console.log('✓ Socket.IO initialized');
  return io;
}

/**
 * Lấy Socket.IO instance
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized! Call initializeSocket first.');
  }
  return io;
}

/**
 * Broadcast bus location to all connected clients
 */
function broadcastBusLocation(location) {
  if (io) {
    io.emit('bus:location', location);
  }
}

/**
 * Broadcast multiple bus locations
 */
function broadcastBusLocations(locations) {
  if (io) {
    io.emit('bus:locations', locations);
  }
}

module.exports = {
  initializeSocket,
  getIO,
  broadcastBusLocation,
  broadcastBusLocations,
};

