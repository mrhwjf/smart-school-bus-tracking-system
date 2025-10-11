module.exports = (sequelize, DataTypes) => {
	const Trip = sequelize.define('Trip', {
		trip_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		route_id: { type: DataTypes.INTEGER, allowNull: false },
		bus_id: { type: DataTypes.INTEGER, allowNull: false },
		start_time: { type: DataTypes.DATE },
		end_time: { type: DataTypes.DATE },
		status: { type: DataTypes.STRING(50), defaultValue: 'SCHEDULED' },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	}, {
		tableName: 'trips',
		timestamps: false,
		indexes: [
			{ fields: ['route_id'], name: 'idx_trip_route' },
			{ fields: ['bus_id'], name: 'idx_trip_bus' }
		]
	});

	return Trip;
};
