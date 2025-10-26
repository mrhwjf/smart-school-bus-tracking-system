module.exports = (sequelize, DataTypes) => {
	const NavigationLog = sequelize.define('NavigationLog', {
		update_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		bus_id: { type: DataTypes.INTEGER, allowNull: false },
		trip_id: { type: DataTypes.INTEGER, allowNull: true },
		latitude: { type: DataTypes.DECIMAL(10, 8), allowNull: true, validate: { min: -90, max: 90 } },
		longitude: { type: DataTypes.DECIMAL(11, 8), allowNull: true, validate: { min: -180, max: 180 } },
		recorded_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	}, {
		tableName: 'navigation_logs',
		underscored: true,
		freezeTableName: true,
		timestamps: false,
		charset: 'utf8mb4',
		scopes: {
			byTrip(tripId) { return { where: { trip_id: tripId } }; },
			byBus(busId) { return { where: { bus_id: busId } }; },
			latest() { return { order: [['recorded_at', 'DESC']], limit: 1 }; }
		},
		indexes: [
			{ name: 'idx_nav_bus', fields: ['bus_id'] },
			{ name: 'idx_nav_trip', fields: ['trip_id'] },
			{ name: 'idx_nav_trip_time', fields: ['trip_id', 'recorded_at'] },
			{ name: 'idx_nav_bus_time', fields: ['bus_id', 'recorded_at'] }
		]
	});

	return NavigationLog;
};
