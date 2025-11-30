const apiResponse = require('../utils/apiResponse');
const createPagination = require('../utils/pagination');
const {
	toMessageDto,
	toNotificationDto,
	toUserNotificationDto,
} = require('../dtos');

const { NotificationRepository } = require('../repositories');

// Messages
async function listMessages({ filter = {}, sort, page = 0, pageSize = 10 } = {}, options = {}) {
	const { rows, count, page: p, pageSize: s, totalPages } = await NotificationRepository.listMessages({ filter, sort, page, pageSize }, options);
	const items = (rows || []).map(toMessageDto);
	const data = createPagination({ items, page: p, size: s, totalElements: count, totalPages });
	return apiResponse.success('Messages fetched successfully', data);
}

async function getMessageById(messageId, options = {}) {
	const msg = await NotificationRepository.findMessageById(messageId, options);
	if (!msg) return apiResponse.failure('Message not found');
	return apiResponse.success('Message fetched successfully', toMessageDto(msg));
}

async function createMessage(data, options = {}) {
	const created = await NotificationRepository.createMessage({
		sender_id: data.senderId,
		message_text: data.messageText,
		sent_at: data.sentAt,
	}, options);
	return apiResponse.success('Message created successfully', toMessageDto(created));
}

async function updateMessage(messageId, changes, options = {}) {
	const updated = await NotificationRepository.updateMessageById(messageId, {
		sender_id: changes.senderId,
		message_text: changes.messageText,
		sent_at: changes.sentAt,
	}, options);
	if (!updated) return apiResponse.failure('Message not found');
	return apiResponse.success('Message updated successfully', toMessageDto(updated));
}

async function deleteMessage(messageId, options = {}) {
	const deleted = await NotificationRepository.deleteMessageById(messageId, options);
	return apiResponse.success('Message deleted successfully', { deleted });
}

// Notifications
async function listNotifications({ filter = {}, sort, page = 0, pageSize = 10 } = {}, options = {}) {
	const { rows, count, page: p, pageSize: s, totalPages } = await NotificationRepository.listNotifications({ filter, sort, page, pageSize }, options);
	const items = (rows || []).map(toNotificationDto);
	const data = createPagination({ items, page: p, size: s, totalElements: count, totalPages });
	return apiResponse.success('Notifications fetched successfully', data);
}

async function getNotificationById(notificationId, options = {}) {
	const n = await NotificationRepository.findNotificationById(notificationId, options);
	if (!n) return apiResponse.failure('Notification not found');
	return apiResponse.success('Notification fetched successfully', toNotificationDto(n));
}

async function createNotification(data, options = {}) {
	const created = await NotificationRepository.createNotification({
		message_id: data.messageId,
		type: data.type,
		sent_at: data.sentAt,
	}, options);
	return apiResponse.success('Notification created successfully', toNotificationDto(created));
}

async function updateNotification(notificationId, changes, options = {}) {
	const updated = await NotificationRepository.updateNotificationById(notificationId, {
		message_id: changes.messageId,
		type: changes.type,
		sent_at: changes.sentAt,
	}, options);
	if (!updated) return apiResponse.failure('Notification not found');
	return apiResponse.success('Notification updated successfully', toNotificationDto(updated));
}

async function deleteNotification(notificationId, options = {}) {
	const deleted = await NotificationRepository.deleteNotificationById(notificationId, options);
	return apiResponse.success('Notification deleted successfully', { deleted });
}

// User notifications
async function listUserNotifications({ filter = {}, sort, page = 0, pageSize = 10 } = {}, options = {}) {
	const { rows, count, page: p, pageSize: s, totalPages } = await NotificationRepository.listUserNotifications({ filter, sort, page, pageSize }, options);
	const items = (rows || []).map(toUserNotificationDto);
	const data = createPagination({ items, page: p, size: s, totalElements: count, totalPages });
	return apiResponse.success('User notifications fetched successfully', data);
}

async function createUserNotification(data, options = {}) {
	const created = await NotificationRepository.createUserNotification({
		notification_id: data.notificationId,
		recipient_id: data.recipientId,
		read_status: data.readStatus,
	}, options);
	return apiResponse.success('User notification created successfully', toUserNotificationDto(created));
}

async function updateUserNotification(notificationId, recipientId, changes, options = {}) {
	const updated = await NotificationRepository.updateUserNotification(notificationId, recipientId, {
		read_status: changes.readStatus,
	}, options);
	if (!updated) return apiResponse.failure('User notification not found');
	return apiResponse.success('User notification updated successfully', toUserNotificationDto(updated));
}

async function deleteUserNotification(notificationId, recipientId, options = {}) {
	const deleted = await NotificationRepository.deleteUserNotification(notificationId, recipientId, options);
	return apiResponse.success('User notification deleted successfully', { deleted });
}

async function markUserNotificationRead(notificationId, recipientId, read = true, options = {}) {
	const updated = await NotificationRepository.markUserNotificationRead(notificationId, recipientId, read, options);
	return apiResponse.success('User notification read status updated', { updated: !!updated });
}

async function bulkMarkUserNotificationsRead(recipientId, read = true, options = {}) {
	const [affected] = await NotificationRepository.bulkMarkUserNotificationsRead(recipientId, read, options);
	return apiResponse.success('User notifications read status updated', { affected });
}

module.exports = {
	// Messages
	listMessages, getMessageById, createMessage, updateMessage, deleteMessage,
	// Notifications
	listNotifications, getNotificationById, createNotification, updateNotification, deleteNotification,
	// User notifications
	listUserNotifications, createUserNotification, updateUserNotification, deleteUserNotification,
	markUserNotificationRead, bulkMarkUserNotificationsRead,
};
