// frontend/src/services/studentService.js
const API_URL = "http://localhost:5000/api/v1";

async function safeFetch(url, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getAllStudents(token) {
  try {
    const data = await safeFetch(`${API_URL}/students`, token);
    // normalize: if API wraps in data.items or data.data.items
    return data;
  } catch (err) {
    console.error("Lỗi khi fetch students:", err);
    return null;
  }
}

export async function getStudentsByParent(parentId, token) {
  if (!parentId) return [];
  try {

    const url = `${API_URL}/students?parentId=${encodeURIComponent(parentId)}`;
    const data = await safeFetch(url, token);


    const items = data?.data?.items ?? data?.items ?? data?.students ?? data;

    if (Array.isArray(items)) return items;

    const fallbackItems = data?.data ?? data?.items ?? [];
    return Array.isArray(fallbackItems) ? fallbackItems : [];
  } catch (err) {
    console.warn("Could not fetch filtered students from backend, falling back to client filter.", err);

    try {
      const all = await getAllStudents(token);
      const items = all?.data?.items ?? all?.items ?? all?.students ?? all ?? [];
      if (!Array.isArray(items)) return [];
      return items.filter((s) =>
        String(s.parentId ?? s.parent?.id ?? s.parent?.userId ?? s.parent?.user_id ?? s.parent?.userId) ===
        String(parentId)
      );
    } catch (err2) {
      console.error("Fallback fetch/filter failed:", err2);
      return [];
    }
  }
}
