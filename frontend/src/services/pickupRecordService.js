import { API_URL } from '../config/api';

export async function getAllPickupRecords() {
    try {
        const res = await fetch(`${API_URL}/pickup-records`);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Lỗi khi fetch routes:", err);
        return null;
    }
}
