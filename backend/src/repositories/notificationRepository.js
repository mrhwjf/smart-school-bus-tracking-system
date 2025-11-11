const { Message, Notification, UserNotification } = require('../models');

// Messages
const MESSAGE_PK = 'message_id';

async function findMessageById(id, options = {}) {
	return Message.findByPk(id, options);
}

async function findMessageOne(where = {}, options = {}) {
	return Message.findOne({ where, ...options });
}

async function listMessages(
	{ filter = {}, sort, page = 0, pageSize = 10 } = {},
	options = {}
) {
	const order = sort
		? [[sort.field, sort.direction === 'DESC' ? 'DESC' : 'ASC']]
		: [['sent_at', 'DESC']];

	const limit = pageSize;
	const offset = page * pageSize;

	const { rows, count } = await Message.findAndCountAll({
		where: filter,
		order,
		limit,
		offset,
		...options,
	});

	const totalPages = pageSize ? Math.ceil(count / pageSize) : 0;
	return { rows, count, page, pageSize, totalPages };
}

async function createMessage(data, options = {}) {
	return Message.create(data, options);
}

async function updateMessageById(id, changes, options = {}) {
	await Message.update(changes, { where: { [MESSAGE_PK]: id }, ...options });
	return findMessageById(id, options);
}

async function deleteMessageById(id, options = {}) {
	return Message.destroy({ where: { [MESSAGE_PK]: id }, ...options });
}

// Notifications
const NOTI_PK = 'notification_id';

async function findNotificationById(id, options = {}) {
	return Notification.findByPk(id, options);
}

async function findNotificationOne(where = {}, options = {}) {
	return Notification.findOne({ where, ...options });
}

async function listNotifications(
	{ filter = {}, sort, page = 0, pageSize = 10 } = {},
	options = {}
) {
	const order = sort
		? [[sort.field, sort.direction === 'DESC' ? 'DESC' : 'ASC']]
		: [['sent_at', 'DESC']];

	const limit = pageSize;
	const offset = page * pageSize;

	const { rows, count } = await Notification.findAndCountAll({
		where: filter,
		order,
		limit,
		offset,
		...options,
	});

	const totalPages = pageSize ? Math.ceil(count / pageSize) : 0;
	return { rows, count, page, pageSize, totalPages };
}

async function createNotification(data, options = {}) {
	return Notification.create(data, options);
}

async function updateNotificationById(id, changes, options = {}) {
	await Notification.update(changes, { where: { [NOTI_PK]: id }, ...options });
	return findNotificationById(id, options);
}

async function deleteNotificationById(id, options = {}) {
	return Notification.destroy({ where: { [NOTI_PK]: id }, ...options });
}

// User notifications (composite key)
async function findUserNotificationOne(where = {}, options = {}) {
	return UserNotification.findOne({ where, ...options });
}

async function listUserNotifications(
	{ filter = {}, sort, page = 0, pageSize = 10 } = {},
	options = {}
) {
	const order = sort
		? [[sort.field, sort.direction === 'DESC' ? 'DESC' : 'ASC']]
		: undefined;

	const limit = pageSize;
	const offset = page * pageSize;

	const { rows, count } = await UserNotification.findAndCountAll({
		where: filter,
		order,
		limit,
		offset,
		...options,
	});

	const totalPages = pageSize ? Math.ceil(count / pageSize) : 0;
	return { rows, count, page, pageSize, totalPages };
}

async function createUserNotification(data, options = {}) {
	return UserNotification.create(data, options);
}

async function updateUserNotification(
	notificationId,
	recipientId,
	changes,
	options = {}
) {
	await UserNotification.update(changes, {
		where: { notification_id: notificationId, recipient_id: recipientId },
		...options,
	});

	return UserNotification.findOne({
		where: { notification_id: notificationId, recipient_id: recipientId },
		...options,
	});
}

async function deleteUserNotification(notificationId, recipientId, options = {}) {
	return UserNotification.destroy({
		where: { notification_id: notificationId, recipient_id: recipientId },
		...options,
	});
}

async function markUserNotificationRead(
	notificationId,
	recipientId,
	read = true,
	options = {}
) {
	return updateUserNotification(
		notificationId,
		recipientId,
		{ read_status: !!read },
		options
	);
}

async function bulkMarkUserNotificationsRead(recipientId, read = true, options = {}) {
	return UserNotification.update(
		{ read_status: !!read },
		{ where: { recipient_id: recipientId }, ...options }
	);
}

module.exports = {
	// Messages
	findMessageById,
	findMessageOne,
	listMessages,
	createMessage,
	updateMessageById,
	deleteMessageById,
	// Notifications
	findNotificationById,
	findNotificationOne,
	listNotifications,
	createNotification,
	updateNotificationById,
	deleteNotificationById,
	// User notifications
	findUserNotificationOne,
	listUserNotifications,
	createUserNotification,
	updateUserNotification,
	deleteUserNotification,
	markUserNotificationRead,
	bulkMarkUserNotificationsRead,
};
