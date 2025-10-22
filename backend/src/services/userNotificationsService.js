const repo = require('../repositories/userNotificationsRepository');
const createHttpError = require('../utils/httpError');

module.exports = {
	list() { return repo.findAll(); },
	async get(notification_id, recipient_id) {
		const un = await repo.findOne(notification_id, recipient_id);
		if (!un) throw createHttpError(404, 'UserNotification not found');
		return un;
	},
	async create(payload) {
		const { notification_id, recipient_id, read_status } = payload;
		if (!notification_id) throw createHttpError(400, 'notification_id is required');
		if (!recipient_id) throw createHttpError(400, 'recipient_id is required');
		// composite PK uniqueness relies on DB; catching duplication is optional.
		try {
			return await repo.create({ notification_id, recipient_id, read_status });
		} catch (err) { throw err; }
	},
	async update(notification_id, recipient_id, payload) {
		const updated = await repo.update(notification_id, recipient_id, payload);
		if (!updated) throw createHttpError(404, 'UserNotification not found');
		return updated;
	},
	async remove(notification_id, recipient_id) {
		const deleted = await repo.remove(notification_id, recipient_id);
		if (!deleted) throw createHttpError(404, 'UserNotification not found');
	}
};
