const redisService = require('./redisService');

class SimulationService {
  constructor() {
    this.simulations = new Map(); // busId -> interval
  }

  /**
   * Tính khoảng cách giữa 2 điểm (Haversine formula)
   * @returns distance in meters
   */
  haversine(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Bán kính trái đất (m)
    const toRad = (x) => (x * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  /**
   * Tính điểm giữa theo tỉ lệ
   */
  interpolate(start, end, ratio) {
    return {
      latitude: start.latitude + (end.latitude - start.latitude) * ratio,
      longitude: start.longitude + (end.longitude - start.longitude) * ratio,
    };
  }

  /**
   * Tính hướng di chuyển (bearing/heading)
   * @returns bearing in degrees (0-360)
   */
  calculateHeading(start, end) {
    const toRad = (x) => (x * Math.PI) / 180;
    const toDeg = (x) => (x * 180) / Math.PI;
    const dLon = toRad(end.longitude - start.longitude);
    const lat1 = toRad(start.latitude);
    const lat2 = toRad(end.latitude);
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  }

  /**
   * Bắt đầu mô phỏng cho 1 xe
   * @param {number} busId - ID của xe bus
   * @param {Array} route - Mảng các điểm dừng {latitude, longitude, name}
   * @param {number} speed - Tốc độ km/h
   * @param {object} io - Socket.IO instance
   */
  async startSimulation(busId, route, speed = 30, io) {
    // 🔥 LUÔN stop simulation cũ trước khi start mới
    if (this.simulations.has(busId)) {
      console.log(`⚠️ Stopping existing simulation for bus ${busId} before starting new one`);
      await this.stopSimulation(busId);
      // Đợi 100ms để cleanup hoàn tất
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!route || route.length < 2) {
      console.error(`Invalid route for bus ${busId}`);
      return { success: false, message: 'Invalid route (need at least 2 stops)' };
    }

    // Khởi tạo state MỚI (luôn ghi đè state cũ)
    let state = {
      busId,
      currentSegment: 0,
      progress: 0,
      route,
      speed,
      status: 'running',
      lastUpdate: Date.now(),
    };
    await redisService.setSimulationState(busId, state);

    console.log(`✓ Starting simulation for bus ${busId} with ${route.length} waypoints at ${speed} km/h`);

    // Update mỗi 2 giây
    const interval = setInterval(async () => {
      try {
        state = await redisService.getSimulationState(busId);
        if (!state || state.status === 'stopped') {
          this.stopSimulation(busId);
          return;
        }

        let { currentSegment, progress, route, speed } = state;
        
        // Kiểm tra xem đã hết tuyến chưa
        if (currentSegment >= route.length - 1) {
          // Quay về điểm đầu
          currentSegment = 0;
          progress = 0;
          console.log(`Bus ${busId} completed route, restarting...`);
        }

        const start = route[currentSegment];
        const end = route[currentSegment + 1];
        
        if (!start || !end) {
          console.error(`Invalid segment for bus ${busId}: ${currentSegment}`);
          return;
        }

        const distance = this.haversine(
          start.latitude,
          start.longitude,
          end.latitude,
          end.longitude
        );

        // Tính progress mới: (speed km/h -> m/s) * 2s / distance
        const speedMps = (speed * 1000) / 3600; // m/s
        const deltaProgress = (speedMps * 2) / distance; // 2 giây interval
        let newProgress = progress + deltaProgress;

        let newSegment = currentSegment;
        if (newProgress >= 1) {
          // Chuyển sang segment tiếp theo
          newProgress = 0;
          newSegment = currentSegment + 1;
          
          if (newSegment >= route.length - 1) {
            // Đã đến điểm cuối
            newSegment = 0;
            newProgress = 0;
          }
        }

        // Tính vị trí hiện tại
        const currentPos = this.interpolate(
          route[newSegment],
          route[newSegment + 1] || route[0],
          newProgress
        );

        // Tính heading
        const heading = this.calculateHeading(
          route[newSegment],
          route[newSegment + 1] || route[0]
        );

        // Lưu vị trí mới
        const location = {
          bus_id: busId,
          latitude: currentPos.latitude,
          longitude: currentPos.longitude,
          recorded_at: new Date().toISOString(),
          speed: speed,
          heading: Math.round(heading),
          currentStop: route[newSegment]?.name || 'Unknown',
          nextStop: route[newSegment + 1]?.name || route[0]?.name || 'Unknown',
        };

        await redisService.setBusLocation(busId, location);

        // Cập nhật state
        state.currentSegment = newSegment;
        state.progress = newProgress;
        state.lastUpdate = Date.now();
        await redisService.setSimulationState(busId, state);

        // Broadcast qua WebSocket
        if (io) {
          io.emit('bus:location', location);
        }

        console.log(
          `Bus ${busId}: Segment ${newSegment + 1}/${route.length}, Progress ${(newProgress * 100).toFixed(1)}%, ` +
          `Pos: [${currentPos.latitude.toFixed(6)}, ${currentPos.longitude.toFixed(6)}]`
        );
      } catch (err) {
        console.error(`Simulation error for bus ${busId}:`, err);
      }
    }, 2000); // Update mỗi 2s

    this.simulations.set(busId, interval);
    console.log(`✓ Simulation started for bus ${busId}`);
    
    return { success: true, message: 'Simulation started' };
  }

  /**
   * Dừng mô phỏng
   */
  async stopSimulation(busId) {
    const interval = this.simulations.get(busId);
    if (interval) {
      clearInterval(interval);
      this.simulations.delete(busId);
      
      // Cập nhật state trong Redis
      const state = await redisService.getSimulationState(busId);
      if (state) {
        state.status = 'stopped';
        await redisService.setSimulationState(busId, state);
      }
      
      console.log(`✓ Simulation stopped for bus ${busId}`);
      return { success: true, message: 'Simulation stopped' };
    }
    
    return { success: false, message: 'No simulation running' };
  }

  /**
   * Dừng tất cả mô phỏng
   */
  async stopAll() {
    const busIds = Array.from(this.simulations.keys());
    for (const busId of busIds) {
      await this.stopSimulation(busId);
    }
    console.log(`✓ All simulations stopped (${busIds.length} buses)`);
  }

  /**
   * Lấy trạng thái mô phỏng hiện tại
   */
  getActiveSimulations() {
    return Array.from(this.simulations.keys());
  }

  /**
   * Kiểm tra xem có simulation nào đang chạy không
   */
  isRunning(busId) {
    return this.simulations.has(busId);
  }
}

module.exports = new SimulationService();
