module.exports = (sequelize, DataTypes) => {
	const Route = sequelize.define('Route', {
		route_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		name: { type: DataTypes.STRING(255), allowNull: false },
		description: { type: DataTypes.TEXT },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	}, {
		tableName: 'routes',
		timestamps: false
	});

	return Route;
};
