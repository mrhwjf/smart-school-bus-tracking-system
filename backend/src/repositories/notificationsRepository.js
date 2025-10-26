const BaseRepository = require('./baseRepository');
const db = require('../models');
const { Op } = require('sequelize');

class NotificationsRepository extends BaseRepository {
	constructor() {
		super(db.Notification, { sortableFields: ['sent_at', 'notification_id', 'type'] });
	}

	buildWhere(filter = {}) {
		const where = {};
		const { notification_id, message_id, type, from, to } = filter;
		if (notification_id) where.notification_id = notification_id;
		if (message_id) where.message_id = message_id;
		if (type) where.type = type;
		if (from || to) {
			where.sent_at = {};
			if (from) where.sent_at[Op.gte] = new Date(from);
			if (to) where.sent_at[Op.lte] = new Date(to);
		}
		return where;
	}
}

module.exports = new NotificationsRepository();
