module.exports = (sequelize, DataTypes) => {
	const Role = sequelize.define('Role', {
		role_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
		description: { type: DataTypes.STRING(255) },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	}, {
		tableName: 'roles',
		timestamps: false
	});

	return Role;
};
