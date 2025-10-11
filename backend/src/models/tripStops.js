module.exports = (sequelize, DataTypes) => {
	const TripStop = sequelize.define('TripStop', {
		trip_id: { type: DataTypes.INTEGER, primaryKey: true },
		stop_id: { type: DataTypes.INTEGER, primaryKey: true },
		stop_order: { type: DataTypes.INTEGER, defaultValue: 0 }
	}, {
		tableName: 'trip_stops',
		timestamps: false,
		indexes: [
			{ fields: ['trip_id'], name: 'idx_ts_trip' },
			{ fields: ['stop_id'], name: 'idx_ts_stop' }
		]
	});

	return TripStop;
};
