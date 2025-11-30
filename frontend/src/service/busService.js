import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

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

