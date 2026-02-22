import { API_URL } from '../config/api';

// frontend/src/services/scheduleService.js
export async function getAllSchedules() {
    try {
        const res = await fetch(`${API_URL}/schedules`);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Lỗi khi fetch schedules:", err);
        return null;
    }
}
