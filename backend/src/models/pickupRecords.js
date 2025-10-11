module.exports = (sequelize, DataTypes) => {
	const PickupRecord = sequelize.define('PickupRecord', {
		record_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		student_id: { type: DataTypes.INTEGER, allowNull: false },
		stop_id: { type: DataTypes.INTEGER, allowNull: false },
		status: { type: DataTypes.ENUM('PICKED_UP', 'DROPPED_OFF', 'MISSED', 'WAITING'), defaultValue: 'WAITING' },
		recorded_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	}, {
		tableName: 'pickup_records',
		timestamps: false,
		indexes: [
			{ fields: ['student_id'], name: 'idx_pr_student' },
			{ fields: ['stop_id'], name: 'idx_pr_stop' }
		]
	});

	return PickupRecord;
};
