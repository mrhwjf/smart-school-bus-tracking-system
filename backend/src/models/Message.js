module.exports = (sequelize, DataTypes) => {
	const Message = sequelize.define('Message', {
		message_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		sender_id: { type: DataTypes.INTEGER, allowNull: true },
		message_text: { type: DataTypes.TEXT, allowNull: false },
		sent_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	}, {
		tableName: 'messages',
		underscored: true,
		freezeTableName: true,
		timestamps: false,
		charset: 'utf8mb4',
		scopes: {
			bySender(senderId) { return { where: { sender_id: senderId } }; },
			recent() { return { order: [['sent_at', 'DESC']] }; }
		}
	});

	return Message;
};
