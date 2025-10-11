module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define('User', {
		user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		role_id: { type: DataTypes.INTEGER, allowNull: false },
		name: { type: DataTypes.STRING(255), allowNull: false },
		phone_number: { type: DataTypes.STRING(20), unique: true },
		email: { type: DataTypes.STRING(255), unique: true },
		password_hash: { type: DataTypes.STRING(255), allowNull: false },
		is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	}, {
		tableName: 'users',
		timestamps: false,
		indexes: [{ fields: ['role_id'], name: 'idx_role_id' }]
	});

	return User;
};
