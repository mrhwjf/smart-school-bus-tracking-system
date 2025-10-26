module.exports = (sequelize, DataTypes) => {
	const Route = sequelize.define('Route', {
		route_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		name: { type: DataTypes.STRING(255), allowNull: false, unique: true },
		description: { type: DataTypes.TEXT, allowNull: true }
	}, {
		tableName: 'routes',
		underscored: true,
		freezeTableName: true,
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at',
		charset: 'utf8mb4'
	});

	return Route;
};
