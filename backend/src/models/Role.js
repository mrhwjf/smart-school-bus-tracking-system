module.exports = (sequelize, DataTypes) => {
	const Role = sequelize.define('Role', {
		role_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		name: { type: DataTypes.STRING(50), allowNull: false, unique: true, validate: { len: [1, 50] } },
		description: { type: DataTypes.STRING(255), allowNull: true }
	}, {
		tableName: 'roles',
		underscored: true,
		freezeTableName: true,
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at',
		charset: 'utf8mb4'
	});

	return Role;
};
