const BaseRepository = require('./baseRepository');
const db = require('../models');

class UserNotificationsRepository extends BaseRepository {
	constructor() {
		super(db.UserNotification, { sortableFields: ['notification_id', 'recipient_id'] });
		this.primaryKey = undefined; // composite handled via object key
	}

	buildWhere(filter = {}) {
		const where = {};
		const { notification_id, recipient_id, read_status } = filter;
		if (notification_id) where.notification_id = notification_id;
		if (recipient_id) where.recipient_id = recipient_id;
		if (typeof read_status === 'boolean') where.read_status = read_status;
		return where;
	}
}

module.exports = new UserNotificationsRepository();
