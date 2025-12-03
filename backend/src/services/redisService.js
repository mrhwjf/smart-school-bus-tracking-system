const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('error', (err) => console.error('Redis error:', err));
redis.on('connect', () => console.log('✓ Redis connected'));

class RedisService {
  /**
   * Lưu vị trí xe bus
   */
  async setBusLocation(busId, location) {
    const key = `bus:location:${busId}`;
    await redis.setex(key, 3600, JSON.stringify(location)); // TTL 1 hour
    return location;
  }

  /**
   * Lấy vị trí xe bus
   */
  async getBusLocation(busId) {
    const key = `bus:location:${busId}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Lấy tất cả vị trí xe
   */
  async getAllBusLocations() {
    const keys = await redis.keys('bus:location:*');
    const locations = [];
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) locations.push(JSON.parse(data));
    }
    return locations;
  }

  /**
   * Lưu trạng thái mô phỏng
   */
  async setSimulationState(busId, state) {
    const key = `bus:simulation:${busId}`;
    await redis.setex(key, 3600, JSON.stringify(state));
  }

  /**
   * Lấy trạng thái mô phỏng
   */
  async getSimulationState(busId) {
    const key = `bus:simulation:${busId}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Xóa dữ liệu xe
   */
  async deleteBusData(busId) {
    await redis.del(`bus:location:${busId}`);
    await redis.del(`bus:simulation:${busId}`);
  }

  /**
   * Kiểm tra kết nối Redis
   */
  async ping() {
    return await redis.ping();
  }
}

module.exports = new RedisService();
