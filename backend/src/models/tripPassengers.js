module.exports = (sequelize, DataTypes) => {
	const TripPassenger = sequelize.define('TripPassenger', {
		trip_id: { type: DataTypes.INTEGER, primaryKey: true },
		student_id: { type: DataTypes.INTEGER, primaryKey: true }
	}, {
		tableName: 'trip_passengers',
		timestamps: false,
		indexes: [
			{ fields: ['trip_id'], name: 'idx_tp_trip' },
			{ fields: ['student_id'], name: 'idx_tp_student' }
		]
	});

	return TripPassenger;
};
