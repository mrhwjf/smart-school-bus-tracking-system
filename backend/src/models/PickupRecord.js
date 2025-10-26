module.exports = (sequelize, DataTypes) => {
	const PickupRecord = sequelize.define('PickupRecord', {
		record_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		student_id: { type: DataTypes.INTEGER, allowNull: false },
		stop_id: { type: DataTypes.INTEGER, allowNull: false },
		trip_id: { type: DataTypes.INTEGER, allowNull: false },
		status: { type: DataTypes.ENUM('PICKED_UP', 'DROPPED_OFF', 'MISSED', 'WAITING'), defaultValue: 'WAITING' },
		recorded_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
	}, {
		tableName: 'pickup_records',
		underscored: true,
		freezeTableName: true,
		timestamps: false,
		charset: 'utf8mb4',
		scopes: {
			byTrip(tripId) { return { where: { trip_id: tripId } }; },
			byStudent(studentId) { return { where: { student_id: studentId } }; },
			timelineAsc() { return { order: [['recorded_at', 'ASC']] }; }
		},
		indexes: [
			{ name: 'idx_pr_composite', fields: ['student_id', 'stop_id', 'trip_id'] },
			{ name: 'idx_pr_trip_time', fields: ['trip_id', 'recorded_at'] },
			{ name: 'idx_pr_student_trip', fields: ['student_id', 'trip_id'] }
		]
	});

	return PickupRecord;
};
