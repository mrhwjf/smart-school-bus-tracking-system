import { API_URL } from '../config/api';

// frontend/src/services/tripService.js
export async function getAllTrips() {
    try {
        const res = await fetch(`${API_URL}/trips`);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Lỗi khi fetch trips:", err);
        return null;
    }
}
