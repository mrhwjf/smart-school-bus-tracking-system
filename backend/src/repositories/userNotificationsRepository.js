const db = require('../models');

module.exports = {
	findAll(options = {}) { return db.UserNotification.findAll({ order: [['notification_id', 'ASC']], ...options }); },
	findOne(notification_id, recipient_id) { return db.UserNotification.findOne({ where: { notification_id, recipient_id } }); },
	create(data) { return db.UserNotification.create(data); },
	async update(notification_id, recipient_id, data) {
		const [c] = await db.UserNotification.update(data, { where: { notification_id, recipient_id } });
		if (!c) return null; return this.findOne(notification_id, recipient_id);
	},
	remove(notification_id, recipient_id) { return db.UserNotification.destroy({ where: { notification_id, recipient_id } }); }
};
