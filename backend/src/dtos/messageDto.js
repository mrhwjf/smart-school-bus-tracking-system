const { toUserDto } = require('./userDto');
const { iso } = require('../utils/helpers');

function toMessageDto(msg) {
	if (!msg) return null;
	return {
		messageId: msg.message_id,
		senderId: msg.sender_id || null,
		messageText: msg.message_text,
		sentAt: iso(msg.sent_at),
		sender: msg.User ? toUserDto_in_message(msg.User) : undefined,
	};
}

function toUserDto_in_message(user) {
	if (!user) return null;
	return {
		userId: user.user_id,
		name: user.name,
		phoneNumber: user.phone_number || null,
		email: user.email || null,
	};
}

module.exports = { toMessageDto };
