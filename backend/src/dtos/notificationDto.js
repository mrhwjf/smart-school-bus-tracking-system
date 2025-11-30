const { toMessageDto } = require('./messageDto');

function iso(date) { return date ? new Date(date).toISOString() : null; }

function toNotificationDto(n) {
	if (!n) return null;
	return {
		notificationId: n.notification_id,
		messageId: n.message_id,
		type: n.type,
		sentAt: iso(n.sent_at),
		message: n.Message ? toMessageDto(n.Message) : undefined,
	};
}

module.exports = { toNotificationDto };
