module.exports = (sequelize, DataTypes) => {
	const Notification = sequelize.define('Notification', {
		notification_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		message_id: { type: DataTypes.INTEGER },
		sent_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		type: { type: DataTypes.ENUM('INFO', 'ALERT', 'REMINDER', 'WARNING'), defaultValue: 'INFO' }
	}, {
		tableName: 'notifications',
		timestamps: false,
		indexes: [{ fields: ['message_id'], name: 'idx_notifications_message' }]
	});

	return Notification;
};
