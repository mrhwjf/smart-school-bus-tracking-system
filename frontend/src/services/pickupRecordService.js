import axios from 'axios';

const API_URL = "http://localhost:5000/api/v1";

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