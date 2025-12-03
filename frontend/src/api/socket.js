import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Kết nối WebSocket
   */
  connect() {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    console.log('Connecting to WebSocket server:', SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      console.log('✓ Socket connected:', this.socket.id);
      this.reconnectAttempts = 0;
      this.notifyListeners('connect', { socketId: this.socket.id });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('✗ Socket disconnected:', reason);
      this.notifyListeners('disconnect', { reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.notifyListeners('connection_failed', { error });
      }
    });

    // Lắng nghe bus location updates
    this.socket.on('bus:location', (location) => {
      console.log('Bus location update:', location.bus_id);
      this.notifyListeners('bus:location', location);
    });

    // Lắng nghe all bus locations
    this.socket.on('bus:locations', (locations) => {
      console.log('All bus locations received:', locations.length);
      this.notifyListeners('bus:locations', locations);
    });

    return this.socket;
  }

  /**
   * Ngắt kết nối WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected manually');
    }
  }

  /**
   * Đăng ký listener cho event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Hủy đăng ký listener
   */
  off(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks && callback) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else if (!callback) {
      // Remove all listeners for this event
      this.listeners.delete(event);
    }
  }

  /**
   * Thông báo tất cả listeners
   */
  notifyListeners(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in listener for ${event}:`, err);
        }
      });
    }
  }

  /**
   * Request all bus locations
   */
  requestAllLocations() {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit('bus:requestAll');
  }

  /**
   * Request location of specific bus
   */
  requestBusLocation(busId) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit('bus:request', { busId });
  }

  /**
   * Kiểm tra trạng thái kết nối
   */
  isConnected() {
    return this.socket?.connected || false;
  }

  /**
   * Lấy socket instance
   */
  getSocket() {
    return this.socket;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
