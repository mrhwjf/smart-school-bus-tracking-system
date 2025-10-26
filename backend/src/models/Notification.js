module.exports = (sequelize, DataTypes) => {
	const Notification = sequelize.define('Notification', {
		notification_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		message_id: { type: DataTypes.INTEGER, allowNull: false },
		sent_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
		type: { type: DataTypes.ENUM('INFO', 'SUCCESS', 'ALERT', 'REMINDER', 'WARNING', 'SYSTEM'), defaultValue: 'INFO' }
	}, {
		tableName: 'notifications',
		underscored: true,
		freezeTableName: true,
		timestamps: false,
		charset: 'utf8mb4',
		indexes: [{ fields: ['message_id'], name: 'idx_notifications_message' }]
	});

	return Notification;
};
