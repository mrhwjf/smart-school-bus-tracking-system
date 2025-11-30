import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

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
    // Lấy today date (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    
    // Gọi API /trips với filter scheduleId và tripDate
    const response = await axios.get(`${API_URL}/trips`, {
      params: {
        tripDate: today,
        // Backend cần filter theo driverId hoặc busId
        // Tạm thời fetch all trips hôm nay và filter client-side
      }
    });

    if (!response.data.success || !response.data.data?.items) {
      return null;
    }

    // Filter trips của driver này (cần có driverId trong trip data)
    const trips = response.data.data.items;
    
    // Tìm trip đầu tiên của driver hôm nay
    // TODO: Backend cần trả về driverId trong trip response
    // Tạm thời return trip đầu tiên
    return trips.length > 0 ? trips[0] : null;
    
  } catch (error) {
    console.error('Error fetching assigned trip:', error);
    return null;
  }
};
