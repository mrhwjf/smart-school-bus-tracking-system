import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';


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


