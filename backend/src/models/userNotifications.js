module.exports = (sequelize, DataTypes) => {
	const UserNotification = sequelize.define('UserNotification', {
		notification_id: { type: DataTypes.INTEGER, primaryKey: true },
		recipient_id: { type: DataTypes.INTEGER, primaryKey: true },
		read_status: { type: DataTypes.BOOLEAN, defaultValue: false }
	}, {
		tableName: 'user_notifications',
		timestamps: false,
		indexes: [
			{ fields: ['notification_id'], name: 'idx_un_notification' },
			{ fields: ['recipient_id'], name: 'idx_un_recipient' }
		]
	});

	return UserNotification;
};
