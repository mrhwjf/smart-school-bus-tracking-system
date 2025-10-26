module.exports = (sequelize, DataTypes) => {
	const Trip = sequelize.define('Trip', {
		trip_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		route_id: { type: DataTypes.INTEGER, allowNull: false },
		bus_id: { type: DataTypes.INTEGER, allowNull: false },
		start_time: { type: DataTypes.DATE, allowNull: true },
		end_time: { type: DataTypes.DATE, allowNull: true },
		status: { type: DataTypes.ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'), defaultValue: 'SCHEDULED' },
		shift: { type: DataTypes.ENUM('MORNING', 'AFTERNOON'), defaultValue: 'MORNING' }
	}, {
		tableName: 'trips',
		underscored: true,
		freezeTableName: true,
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at',
		charset: 'utf8mb4',
		validate: {
			endAfterStart() {
				if (this.end_time && this.start_time && !(this.end_time > this.start_time)) {
					throw new Error('end_time must be greater than start_time');
				}
			}
		},
		scopes: {
			byRoute(routeId) { return { where: { route_id: routeId } }; },
			byBus(busId) { return { where: { bus_id: busId } }; },
			withStatus(status) { return { where: { status } }; },
			current() { return { where: { status: ['SCHEDULED', 'IN_PROGRESS'] } }; }
		},
		indexes: [
			{ name: 'idx_trip_route', fields: ['route_id'] },
			{ name: 'idx_trip_bus', fields: ['bus_id'] },
			{ name: 'idx_trips_status_start', fields: ['status', 'start_time'] },
			{ name: 'idx_trips_route_start', fields: ['route_id', 'start_time'] },
			{ name: 'idx_trips_bus_start', fields: ['bus_id', 'start_time'] }
		]
	});

	return Trip;
};
