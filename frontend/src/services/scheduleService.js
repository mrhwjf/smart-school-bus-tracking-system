import axios from "axios";

const API_URL = "http://localhost:5000/api/v1";

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