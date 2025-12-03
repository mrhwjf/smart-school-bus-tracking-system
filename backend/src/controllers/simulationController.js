const simulationService = require('../services/simulationService');
const redisService = require('../services/redisService');
const { getIO } = require('../services/socketService');
const { Trip, Schedule, Route, Stop, Bus } = require('../models');

class SimulationController {
  /**
   * Bắt đầu mô phỏng cho một trip
   */
  async startSimulation(req, res) {
    try {
      const { tripId } = req.params;
      const { speed = 30 } = req.body; // km/h

      console.log('Starting simulation for trip:', tripId);

      // Lấy trip với đầy đủ thông tin: Trip -> Schedule -> Route -> Stops
      const trip = await Trip.findByPk(tripId, {
        include: [
          {
            model: Schedule,
            include: [
              {
                model: Route,
                include: [
                  {
                    model: Stop,
                    through: {
                      attributes: ['stop_order'],
                    },
                  },
                ],
              },
              {
                model: Bus,
              },
            ],
          },
        ],
      });

      console.log('Trip loaded:', trip ? 'YES' : 'NO');
      if (trip) {
        console.log('Schedule:', trip.Schedule ? 'YES' : 'NO');
        if (trip.Schedule) {
          console.log('Route:', trip.Schedule.Route ? 'YES' : 'NO');
          console.log('Bus:', trip.Schedule.Bus ? 'YES' : 'NO');
          if (trip.Schedule.Route) {
            console.log('Stops count:', trip.Schedule.Route.Stops?.length || 0);
          }
        }
      }

      if (!trip) {
        return res.status(404).json({
          success: false,
          message: 'Trip not found',
        });
      }

      if (!trip.Schedule || !trip.Schedule.Route || !trip.Schedule.Route.Stops || trip.Schedule.Route.Stops.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Route must have at least 2 stops',
          debug: {
            hasSchedule: !!trip.Schedule,
            hasRoute: !!trip.Schedule?.Route,
            stopsCount: trip.Schedule?.Route?.Stops?.length || 0,
          }
        });
      }

      const busId = trip.Schedule.Bus?.bus_id;
      
      if (!busId) {
        return res.status(400).json({
          success: false,
          message: 'Bus not found in schedule',
        });
      }

      // Sắp xếp stops theo stop_order
      const route = trip.Schedule.Route.Stops
        .sort((a, b) => {
          const seqA = a.RouteStop?.stop_order || 0;
          const seqB = b.RouteStop?.stop_order || 0;
          return seqA - seqB;
        })
        .map((stop) => ({
          latitude: parseFloat(stop.latitude),
          longitude: parseFloat(stop.longitude),
          name: stop.name,
          address: stop.address,
        }))
        .filter(stop => !isNaN(stop.latitude) && !isNaN(stop.longitude));

      console.log('Processed route stops:', route.length);

      if (route.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Valid route stops not found (need at least 2 with valid coordinates)',
        });
      }

      const io = getIO();
      const result = await simulationService.startSimulation(busId, route, speed, io);

      console.log('Simulation started:', result.success);

      res.json({
        success: result.success,
        message: result.message,
        data: {
          busId,
          tripId,
          routeLength: route.length,
          speed,
        },
      });
    } catch (error) {
      console.error('Start simulation error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
        error: error.toString(),
      });
    }
  }

  /**
   * Bắt đầu mô phỏng trực tiếp với route data
   */
  async startSimulationWithRoute(req, res) {
    try {
      const { busId, route, speed = 30 } = req.body;

      console.log(`🚀 startSimulationWithRoute: busId=${busId}, route length=${route?.length}, speed=${speed}`);

      if (!busId || !route || !Array.isArray(route) || route.length < 2) {
        console.error('❌ Invalid request:', { busId, routeLength: route?.length });
        return res.status(400).json({
          success: false,
          message: 'Invalid request: busId and route (min 2 stops) required',
        });
      }

      console.log(`✓ Route received with ${route.length} waypoints`);
      console.log(`  First waypoint:`, route[0]);
      console.log(`  Last waypoint:`, route[route.length - 1]);

      const io = getIO();
      const result = await simulationService.startSimulation(busId, route, speed, io);

      console.log(`✓ Simulation result:`, result);

      res.json({
        success: result.success,
        message: result.message,
        data: {
          busId,
          routeLength: route.length,
          speed,
        },
      });
    } catch (error) {
      console.error('Start simulation with route error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }

  /**
   * Dừng mô phỏng cho một xe
   */
  async stopSimulation(req, res) {
    try {
      const { busId } = req.params;
      
      const result = await simulationService.stopSimulation(parseInt(busId));

      res.json({
        success: result.success,
        message: result.message,
        data: { busId },
      });
    } catch (error) {
      console.error('Stop simulation error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }

  /**
   * Dừng tất cả mô phỏng
   */
  async stopAllSimulations(req, res) {
    try {
      await simulationService.stopAll();

      res.json({
        success: true,
        message: 'All simulations stopped',
      });
    } catch (error) {
      console.error('Stop all simulations error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }

  /**
   * Lấy vị trí xe bus
   */
  async getBusLocation(req, res) {
    try {
      const { busId } = req.params;
      const location = await redisService.getBusLocation(parseInt(busId));

      if (!location) {
        return res.status(404).json({
          success: false,
          message: 'Bus location not found',
        });
      }

      res.json({
        success: true,
        data: location,
      });
    } catch (error) {
      console.error('Get bus location error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }

  /**
   * Lấy tất cả vị trí xe bus
   */
  async getAllBusLocations(req, res) {
    try {
      const locations = await redisService.getAllBusLocations();

      res.json({
        success: true,
        data: locations,
      });
    } catch (error) {
      console.error('Get all bus locations error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }

  /**
   * Lấy danh sách simulation đang chạy
   */
  async getActiveSimulations(req, res) {
    try {
      const activeBusIds = simulationService.getActiveSimulations();

      res.json({
        success: true,
        data: {
          count: activeBusIds.length,
          busIds: activeBusIds,
        },
      });
    } catch (error) {
      console.error('Get active simulations error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }

  /**
   * Kiểm tra trạng thái simulation của 1 xe
   */
  async getSimulationStatus(req, res) {
    try {
      const { busId } = req.params;
      const isRunning = simulationService.isRunning(parseInt(busId));
      const state = await redisService.getSimulationState(parseInt(busId));

      res.json({
        success: true,
        data: {
          busId: parseInt(busId),
          isRunning,
          state,
        },
      });
    } catch (error) {
      console.error('Get simulation status error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }
}

module.exports = new SimulationController();
