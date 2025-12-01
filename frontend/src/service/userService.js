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