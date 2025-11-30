import axios from "axios";

const API_URL = "http://localhost:5000/api/v1";

/**
 * Send alert notification with bus location
 * @param {Object} data - { messageText, type, latitude, longitude, recipientIds }
 * type: 'INFO' | 'ALERT' | 'REMINDER' | 'WARNING'
 */
export const sendAlert = async (data) => {
  try {
    const { messageText, type = 'INFO', latitude, longitude, recipientIds = [] } = data;
    
    // 1. Create message with location info
    const messagePayload = {
      messageText: `${messageText}\n📍 Vị trí: ${latitude}, ${longitude}`,
    };
    const messageResponse = await axios.post(`${API_URL}/messages`, messagePayload);
    
    if (!messageResponse.data.success) {
      throw new Error("Failed to create message");
    }
    
    const messageId = messageResponse.data.data.messageId;
    
    // 2. Create notification linked to message
    const notificationPayload = {
      messageId,
      type,
    };
    const notificationResponse = await axios.post(`${API_URL}/notifications`, notificationPayload);
    
    if (!notificationResponse.data.success) {
      throw new Error("Failed to create notification");
    }
    
    const notificationId = notificationResponse.data.data.notificationId;
    
    // 3. Send to recipients (if specified)
    if (recipientIds.length > 0) {
      const userNotificationPromises = recipientIds.map(recipientId =>
        axios.post(`${API_URL}/user-notifications`, {
          notificationId,
          recipientId,
          readStatus: false,
        })
      );
      await Promise.all(userNotificationPromises);
    }
    
    return {
      success: true,
      data: {
        messageId,
        notificationId,
      },
    };
  } catch (error) {
    console.error("Error sending alert:", error);
    throw error;
  }
};

/**
 * Get all notifications
 */
export const getAllNotifications = async (params = {}) => {
  try {
    const { page = 0, size = 10, type } = params;
    const queryParams = new URLSearchParams({ page, size });
    if (type) queryParams.append('type', type);
    
    const response = await axios.get(`${API_URL}/notifications?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

/**
 * Get user notifications for specific recipient
 */
export const getUserNotifications = async (recipientId, params = {}) => {
  try {
    const { page = 0, size = 10, readStatus } = params;
    const queryParams = new URLSearchParams({ page, size, recipientId });
    if (readStatus !== undefined) queryParams.append('readStatus', readStatus);
    
    const response = await axios.get(`${API_URL}/user-notifications?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    throw error;
  }
};

/**
 * Mark notification as read
 */
export const markNotificationRead = async (notificationId, recipientId, readStatus = true) => {
  try {
    const response = await axios.patch(
      `${API_URL}/user-notifications/${notificationId}/recipients/${recipientId}/read`,
      { readStatus }
    );
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};
