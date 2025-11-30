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


