import axios from 'axios';

const API_URL = "http://localhost:5000/api/v1";



// Get all users
export async function getAllUsers() {
  try {
      const res = await fetch("http://localhost:5000/api/v1/users");
      const data = await res.json();
      return data;
  } catch (err) {
      console.error("Lỗi khi fetch user:", err);
      return null;
  }
}

// Get user by ID (includes driverInfo if user is driver)
export async function getUserById(userId) {
  try {
      const res = await axios.get(`${API_URL}/users/${userId}`);
      return res.data;
  } catch (err) {
      console.error(`Lỗi khi fetch user ${userId}:`, err);
      return {
        success: false,
        message: err.message,
        data: null
      };
  }
}




/**
 * Lấy thông tin chi tiết của xe buýt theo busId
 * @param {number} busId - ID của xe buýt
 * @returns {Promise} Response chứa thông tin xe buýt (plateNumber, model, status, capacity)
 */
export const getBusById = async (busId) => {
  try {
    const response = await axios.get(`${API_URL}/buses/${busId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bus:', error);
    throw error;
  }
};



/**
 * Lấy tất cả lịch trình
 * @returns {Promise} Response chứa danh sách lịch trình
 */
export const getAllSchedules = async () => {
  try {
    const response = await axios.get(`${API_URL}/schedules`);
    return response.data;
  } catch (error) {
    console.error('Error fetching schedules:', error);
    throw error;
  }
};

/**
 * Lấy lịch trình theo scheduleId
 * @param {number} scheduleId - ID của lịch trình
 * @returns {Promise} Response chứa thông tin lịch trình
 */
export const getScheduleById = async (scheduleId) => {
  try {
    const response = await axios.get(`${API_URL}/schedules/${scheduleId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching schedule:', error);
    throw error;
  }
};

/**
 * Lấy lịch trình của tài xế theo driverId
 * @param {number} driverId - ID của tài xế
 * @returns {Promise} Response chứa danh sách lịch trình của tài xế
 */
export const getSchedulesByDriverId = async (driverId) => {
  try {
    const response = await getAllSchedules();
    if (response.success && response.data && response.data.items) {
      // Lọc lịch trình theo driverId
      const driverSchedules = response.data.items.filter(
        schedule => schedule.driverId === driverId
      );
      return {
        ...response,
        data: {
          ...response.data,
          items: driverSchedules,
          totalElements: driverSchedules.length
        }
      };
    }
    return response;
  } catch (error) {
    console.error('Error fetching driver schedules:', error);
    throw error;
  }
};


/**
 * Lấy route theo routeId (bao gồm stops và students)
 * @param {number} routeId - ID của route
 * @returns {Promise} Response chứa thông tin route với stops và students
 */
export const getRouteById = async (routeId) => {
  try {
    const response = await axios.get(`${API_URL}/routes/${routeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching route:', error);
    throw error;
  }
};




/**
 * Lấy tất cả trips với các query params tùy chọn
 * @param {Object} params - Query parameters (scheduleId, tripDate, status, etc.)
 * @returns {Promise} Response chứa danh sách trips
 */
export const getAllTrips = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/trips`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching trips:', error);
    throw error;
  }
};

/**
 * Lấy trip được phân công cho driver hôm nay
 * @param {number} driverId - ID của driver
 * @returns {Promise<Object|null>} Trip data hoặc null nếu không có chuyến
 */
export const getAssignedTripForDriver = async (driverId) => {
  try {
    // Lấy today date (YYYY-MM-DD) theo local timezone
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    // 1. Fetch schedules của driver để lấy danh sách scheduleIds
    const schedulesResult = await getSchedulesByDriverId(driverId);
    
    if (!schedulesResult || !schedulesResult.success || !schedulesResult.data?.items) {
      return null;
    }

    const schedules = schedulesResult.data.items;
    if (schedules.length === 0) {
      return null;
    }

    // Tạo map scheduleId -> schedule để lấy thời gian sau này
    const scheduleMap = {};
    schedules.forEach(s => {
      scheduleMap[s.scheduleId] = s;
    });

    // 2. Fetch tất cả trips hôm nay
    const response = await axios.get(`${API_URL}/trips`, {
      params: {
        tripDate: today,
        size: 100
      }
    });

    if (!response.data.success || !response.data.data?.items) {
      return null;
    }

    const allTrips = response.data.data.items;

    // 3. Filter trips theo scheduleIds của driver và status
    const driverTrips = allTrips.filter(trip => {
      const matchSchedule = scheduleMap[trip.scheduleId] !== undefined;
      const isActive = trip.status === 'SCHEDULED' || trip.status === 'IN_PROGRESS';
      return matchSchedule && isActive;
    });

    if (driverTrips.length === 0) {
      return null;
    }

    // 4. Sort trips theo actual_start_time (hoặc schedule startTime nếu chưa có actual)
    const sortedTrips = driverTrips.sort((a, b) => {
      const scheduleA = scheduleMap[a.scheduleId];
      const scheduleB = scheduleMap[b.scheduleId];
      
      const timeA = a.actualStartTime 
        ? new Date(a.actualStartTime)
        : (scheduleA?.startTime ? new Date(`2000-01-01T${scheduleA.startTime}`) : new Date(0));
      
      const timeB = b.actualStartTime
        ? new Date(b.actualStartTime)
        : (scheduleB?.startTime ? new Date(`2000-01-01T${scheduleB.startTime}`) : new Date(0));
      
      return timeA - timeB;
    });

    // 5. Return trip SỚM NHẤT
    return sortedTrips[0];
    
  } catch (error) {
    console.error('Error fetching assigned trip:', error);
    return null;
  }
};


/**
 * Lấy danh sách pickup records
 * @param {Object} params - Query params: tripId, studentId, page, size
 */
export const getPickupRecords = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/pickup-records`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching pickup records:", error);
    throw error;
  }
};

/**
 * Tạo pickup record mới khi tài xế đánh dấu học sinh
 * @param {Object} data - { studentId, stopId, tripId, status, recordedAt }
 */
export const createPickupRecord = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/pickup-records`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating pickup record:", error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái pickup record
 * @param {number} recordId - ID của pickup record
 * @param {Object} data - { status, recordedAt }
 */
export const updatePickupRecord = async (recordId, data) => {
  try {
    const response = await axios.put(`${API_URL}/pickup-records/${recordId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating pickup record:", error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái trip
 * @param {number} tripId - ID của trip
 * @param {Object} data - { status, actualStartTime, actualEndTime }
 */
export const updateTrip = async (tripId, data) => {
  try {
    const response = await axios.put(`${API_URL}/trips/${tripId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating trip:", error);
    throw error;
  }
};

export const getAllStudents = async () => {
  try {
    const response = await axios.get(`${API_URL}/students`);
    return response.data;
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};


/**
 * Send alert notification with bus location
 * @param {Object} data - { messageText, type, latitude, longitude, recipientIds }
 * type: 'INFO' | 'ALERT' | 'REMINDER' | 'WARNING'
 */
export const sendAlert = async (data) => {
  try {
    const { messageText, type = 'INFO', latitude, longitude, recipientIds = [] } = data;
    
    // 1. Create message with location info
    const messagePayload = {
      messageText: `${messageText}\n📍 Vị trí: ${latitude}, ${longitude}`,
    };
    const messageResponse = await axios.post(`${API_URL}/messages`, messagePayload);
    
    if (!messageResponse.data.success) {
      throw new Error("Failed to create message");
    }
    
    const messageId = messageResponse.data.data.messageId;
    
    // 2. Create notification linked to message
    const notificationPayload = {
      messageId,
      type,
    };
    const notificationResponse = await axios.post(`${API_URL}/notifications`, notificationPayload);
    
    if (!notificationResponse.data.success) {
      throw new Error("Failed to create notification");
    }
    
    const notificationId = notificationResponse.data.data.notificationId;
    
    // 3. Send to recipients (if specified)
    if (recipientIds.length > 0) {
      const userNotificationPromises = recipientIds.map(recipientId =>
        axios.post(`${API_URL}/user-notifications`, {
          notificationId,
          recipientId,
          readStatus: false,
        })
      );
      await Promise.all(userNotificationPromises);
    }
    
    return {
      success: true,
      data: {
        messageId,
        notificationId,
      },
    };
  } catch (error) {
    console.error("Error sending alert:", error);
    throw error;
  }
};
