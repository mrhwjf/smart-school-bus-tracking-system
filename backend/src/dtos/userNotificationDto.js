const { toNotificationDto } = require('./notificationDto');

function toUserNotificationDto(un) {
	if (!un) return null;
	return {
		notificationId: un.notification_id,
		recipientId: un.recipient_id,
		readStatus: un.read_status === true,
		notification: un.Notification ? toNotificationDto(un.Notification) : undefined,
	};
}

module.exports = { toUserNotificationDto };
