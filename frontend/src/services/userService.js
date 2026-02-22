// frontend/src/services/userService.js
import { API_URL } from '../config/api';

async function safeFetch(url, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getAllUsers(token) {
  try {
    const data = await safeFetch(`${API_URL}/users`, token);
    return data;
  } catch (err) {
    console.error("Lỗi khi fetch user:", err);
    return null;
  }
}
