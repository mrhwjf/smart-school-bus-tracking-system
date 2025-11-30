import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

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
