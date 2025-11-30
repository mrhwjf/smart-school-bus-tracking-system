const { Router } = require('express');
const router = Router();
const { handleValidation } = require('../middlewares/handleValidation');

const { notificationController } = require('../controllers');
const {
	listMessagesQuery, createMessageRequest, updateMessageRequest,
	listNotificationsQuery, createNotificationRequest, updateNotificationRequest,
	listUserNotificationsQuery, createUserNotificationRequest, updateUserNotificationRequest,
} = require('../middlewares/validation');


// Messages
router.get('/messages', listMessagesQuery, handleValidation, notificationController.listMessages);
router.get('/messages/:messageId', notificationController.getMessage);
router.post('/messages', createMessageRequest, handleValidation, notificationController.createMessage);
router.put('/messages/:messageId', updateMessageRequest, handleValidation, notificationController.updateMessage);
router.delete('/messages/:messageId', notificationController.deleteMessage);

// Notifications
router.get('/notifications', listNotificationsQuery, handleValidation, notificationController.listNotifications);
router.get('/notifications/:notificationId', notificationController.getNotification);
router.post('/notifications', createNotificationRequest, handleValidation, notificationController.createNotification);
router.put('/notifications/:notificationId', updateNotificationRequest, handleValidation, notificationController.updateNotification);
router.delete('/notifications/:notificationId', notificationController.deleteNotification);

// User notifications
router.get('/user-notifications', listUserNotificationsQuery, handleValidation, notificationController.listUserNotifications);
router.post('/user-notifications', createUserNotificationRequest, handleValidation, notificationController.createUserNotification);
router.put('/user-notifications/:notificationId/recipients/:recipientId', updateUserNotificationRequest, handleValidation, notificationController.updateUserNotification);
router.delete('/user-notifications/:notificationId/recipients/:recipientId', notificationController.deleteUserNotification);

// Mark read operations
router.patch('/user-notifications/:notificationId/recipients/:recipientId/read', updateUserNotificationRequest, handleValidation, notificationController.markRead);
router.patch('/user-notifications/recipients/:recipientId/read', notificationController.bulkMarkRead);

module.exports = router;
