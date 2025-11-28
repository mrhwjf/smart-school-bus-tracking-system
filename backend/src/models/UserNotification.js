module.exports = (sequelize, DataTypes) => {
	const UserNotification = sequelize.define('UserNotification', {
		notification_id: { type: DataTypes.INTEGER, primaryKey: true },
		recipient_id: { type: DataTypes.INTEGER, primaryKey: true },
		read_status: { type: DataTypes.BOOLEAN, defaultValue: false }
	}, {
		tableName: 'user_notifications',
		underscored: true,
		freezeTableName: true,
		timestamps: false,
		charset: 'utf8mb4',
		scopes: {
			forRecipient(recipientId) { return { where: { recipient_id: recipientId } }; },
			unread() { return { where: { read_status: false } }; },
			unreadForRecipient(recipientId) { return { where: { recipient_id: recipientId, read_status: false } }; }
		},
		indexes: [
			{ name: 'idx_un_recipient_read', fields: ['recipient_id', 'read_status'] }
		]
	});

	return UserNotification;
};
