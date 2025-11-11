const { notificationService } = require('../services');

// Messages
async function listMessages(req, res, next) {
	try {
		const { page = 0, size = 10, senderId } = req.query;
		const filter = {};
		if (senderId) filter.sender_id = Number(senderId);
		const result = await notificationService.listMessages({ filter, page: Number(page), pageSize: Number(size) });
		res.json(result);
	} catch (err) { next(err); }
}

async function getMessage(req, res, next) {
	try {
		const { messageId } = req.params;
		const result = await notificationService.getMessageById(Number(messageId));
		const status = result.success ? 200 : 404;
		res.status(status).json(result);
	} catch (err) { next(err); }
}

async function createMessage(req, res, next) {
	try {
		const result = await notificationService.createMessage(req.body);
		res.status(201).json(result);
	} catch (err) { next(err); }
}

async function updateMessage(req, res, next) {
	try {
		const { messageId } = req.params;
		const result = await notificationService.updateMessage(Number(messageId), req.body);
		const status = result.success ? 200 : 404;
		res.status(status).json(result);
	} catch (err) { next(err); }
}

async function deleteMessage(req, res, next) {
	try {
		const { messageId } = req.params;
		const result = await notificationService.deleteMessage(Number(messageId));
		res.json(result);
	} catch (err) { next(err); }
}

// Notifications
async function listNotifications(req, res, next) {
	try {
		const { page = 0, size = 10, type } = req.query;
		const filter = {};
		if (type) filter.type = type;
		const result = await notificationService.listNotifications({ filter, page: Number(page), pageSize: Number(size) });
		res.json(result);
	} catch (err) { next(err); }
}

async function getNotification(req, res, next) {
	try {
		const { notificationId } = req.params;
		const result = await notificationService.getNotificationById(Number(notificationId));
		const status = result.success ? 200 : 404;
		res.status(status).json(result);
	} catch (err) { next(err); }
}

async function createNotification(req, res, next) {
	try {
		const result = await notificationService.createNotification(req.body);
		res.status(201).json(result);
	} catch (err) { next(err); }
}

async function updateNotification(req, res, next) {
	try {
		const { notificationId } = req.params;
		const result = await notificationService.updateNotification(Number(notificationId), req.body);
		const status = result.success ? 200 : 404;
		res.status(status).json(result);
	} catch (err) { next(err); }
}

async function deleteNotification(req, res, next) {
	try {
		const { notificationId } = req.params;
		const result = await notificationService.deleteNotification(Number(notificationId));
		res.json(result);
	} catch (err) { next(err); }
}

// User notifications
async function listUserNotifications(req, res, next) {
	try {
		const { page = 0, size = 10, recipientId, readStatus } = req.query;
		const filter = {};
		if (recipientId) filter.recipient_id = Number(recipientId);
		if (readStatus !== undefined) filter.read_status = readStatus === 'true' || readStatus === true;
		const result = await notificationService.listUserNotifications({ filter, page: Number(page), pageSize: Number(size) });
		res.json(result);
	} catch (err) { next(err); }
}

async function createUserNotification(req, res, next) {
	try {
		const result = await notificationService.createUserNotification(req.body);
		res.status(201).json(result);
	} catch (err) { next(err); }
}

async function updateUserNotification(req, res, next) {
	try {
		const { notificationId, recipientId } = req.params;
		const result = await notificationService.updateUserNotification(Number(notificationId), Number(recipientId), req.body);
		const status = result.success ? 200 : 404;
		res.status(status).json(result);
	} catch (err) { next(err); }
}

async function deleteUserNotification(req, res, next) {
	try {
		const { notificationId, recipientId } = req.params;
		const result = await notificationService.deleteUserNotification(Number(notificationId), Number(recipientId));
		res.json(result);
	} catch (err) { next(err); }
}

async function markRead(req, res, next) {
	try {
		const { notificationId, recipientId } = req.params;
		const { readStatus = true } = req.body || {};
		const result = await notificationService.markUserNotificationRead(Number(notificationId), Number(recipientId), !!readStatus);
		res.json(result);
	} catch (err) { next(err); }
}

async function bulkMarkRead(req, res, next) {
	try {
		const { recipientId } = req.params;
		const { readStatus = true } = req.body || {};
		const result = await notificationService.bulkMarkUserNotificationsRead(Number(recipientId), !!readStatus);
		res.json(result);
	} catch (err) { next(err); }
}

module.exports = {
	// Messages
	listMessages, getMessage, createMessage, updateMessage, deleteMessage,
	// Notifications
	listNotifications, getNotification, createNotification, updateNotification, deleteNotification,
	// User Notifications
	listUserNotifications, createUserNotification, updateUserNotification, deleteUserNotification,
	markRead, bulkMarkRead,
};
