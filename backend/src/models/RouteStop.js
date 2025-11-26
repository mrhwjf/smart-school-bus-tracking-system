module.exports = (sequelize, DataTypes) => {
	const RouteStop = sequelize.define('RouteStop', {
		route_id: { type: DataTypes.INTEGER, primaryKey: true },
		stop_id: { type: DataTypes.INTEGER, primaryKey: true },
		stop_order: { type: DataTypes.INTEGER, defaultValue: 0 }
	}, {
		tableName: 'route_stops',
		underscored: true,
		freezeTableName: true,
		timestamps: false,
		charset: 'utf8mb4',
		indexes: [
			{ name: 'idx_route_stops_route_order', fields: ['route_id', 'stop_order'] }
		]
	});

	return RouteStop;
};
