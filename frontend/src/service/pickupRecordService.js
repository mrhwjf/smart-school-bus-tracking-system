import axios from "axios";

const BASE_URL = "http://localhost:5000/api/v1";

/**
 * Lấy danh sách pickup records
 * @param {Object} params - Query params: tripId, studentId, page, size
 */
export const getPickupRecords = async (params = {}) => {
  try {
    const response = await axios.get(`${BASE_URL}/pickup-records`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching pickup records:", error);
    throw error;
  }
};

/**
 * Tạo pickup record mới khi tài xế đánh dấu học sinh
 * @param {Object} data - { studentId, stopId, tripId, status, recordedAt }
 */
export const createPickupRecord = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/pickup-records`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating pickup record:", error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái pickup record
 * @param {number} recordId - ID của pickup record
 * @param {Object} data - { status, recordedAt }
 */
export const updatePickupRecord = async (recordId, data) => {
  try {
    const response = await axios.put(`${BASE_URL}/pickup-records/${recordId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating pickup record:", error);
    throw error;
  }
};

/**
 * Lấy chi tiết một pickup record
 * @param {number} recordId - ID của pickup record
 */
export const getPickupRecordById = async (recordId) => {
  try {
    const response = await axios.get(`${BASE_URL}/pickup-records/${recordId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching pickup record:", error);
    throw error;
  }
};

/**
 * Xóa pickup record
 * @param {number} recordId - ID của pickup record
 */
export const deletePickupRecord = async (recordId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/pickup-records/${recordId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting pickup record:", error);
    throw error;
  }
};

/**
 * Cập nhật hàng loạt PICKED_UP → DROPPED_OFF khi hoàn thành chuyến
 * @param {number} tripId - ID của trip
 */
export const bulkUpdateToDroppedOff = async (tripId) => {
  try {
    const response = await getPickupRecords({ tripId, size: 200 });

    if (!response.success || !response.data?.items) {
      return { success: false, count: 0, total: 0 };
    }

    const pickedUpRecords = response.data.items.filter(r => r.status === 'PICKED_UP');
    
    if (pickedUpRecords.length === 0) {
      return { success: true, count: 0, total: 0 };
    }

    const updatePromises = pickedUpRecords.map(record =>
      updatePickupRecord(record.recordId, {
        status: "DROPPED_OFF",
        recordedAt: new Date().toISOString(),
      })
    );
    
    const results = await Promise.all(updatePromises);
    const successCount = results.filter(r => r.success).length;
    
    return {
      success: true,
      count: successCount,
      total: pickedUpRecords.length,
    };
  } catch (error) {
    console.error("Error bulk updating to DROPPED_OFF:", error);
    throw error;
  }
};
