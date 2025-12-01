import axios from "axios";

const API_URL = "http://localhost:5000/api/v1";

// frontend/src/services/userService.js
export async function getAllStudents(){
    try {
        const res = await fetch(`${API_URL}/students`);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Lỗi khi fetch students:", err);
        return null;
    }
}