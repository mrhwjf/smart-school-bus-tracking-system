import axios from "axios";

const API_URL = "http://localhost:5000/api/v1";

/**
 * Get all students
 */
export const getAllStudents = async () => {
  try {
    const response = await axios.get(`${API_URL}/students`);
    return response.data;
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};

