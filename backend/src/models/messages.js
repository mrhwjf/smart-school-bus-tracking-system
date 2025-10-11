module.exports = (sequelize, DataTypes) => {
	const Message = sequelize.define('Message', {
		message_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		message_text: { type: DataTypes.TEXT, allowNull: false },
		sent_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	}, {
		tableName: 'messages',
		timestamps: false
	});

	return Message;
};
