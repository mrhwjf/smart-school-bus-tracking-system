module.exports = (sequelize, DataTypes) => {
	const TripStop = sequelize.define('TripStop', {
		trip_id: { type: DataTypes.INTEGER, primaryKey: true },
		stop_id: { type: DataTypes.INTEGER, primaryKey: true },
		stop_order: { type: DataTypes.INTEGER, defaultValue: 0 }
	}, {
		tableName: 'trip_stops',
		underscored: true,
		freezeTableName: true,
		timestamps: false,
		charset: 'utf8mb4',
		indexes: [
			{ name: 'idx_ts_stop', fields: ['stop_id'] },
			{ name: 'idx_ts_trip_order', fields: ['trip_id', 'stop_order'] }
		]
	});

	return TripStop;
};
