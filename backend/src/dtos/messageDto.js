const { toUserDto } = require('./userDto');
const { iso } = require('../utils/helpers');

function toMessageDto(msg) {
	if (!msg) return null;
	return {
		messageId: msg.message_id,
		senderId: msg.sender_id || null,
		messageText: msg.message_text,
		sentAt: iso(msg.sent_at),
		sender: msg.User ? toUserDto(msg.User) : undefined,
	};
}

module.exports = { toMessageDto };
