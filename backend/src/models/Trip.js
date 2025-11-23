module.exports = (sequelize, DataTypes) => {
	const Trip = sequelize.define('Trip', {
		trip_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		schedule_id: { type: DataTypes.INTEGER, allowNull: false },
		trip_date: { type: DataTypes.DATEONLY, allowNull: false },
		driver_id: { type: DataTypes.INTEGER, allowNull: true }, // optional override
		status: { type: DataTypes.ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'), defaultValue: 'SCHEDULED' },
		actual_start_time: { type: DataTypes.DATE, allowNull: true },
		actual_end_time: { type: DataTypes.DATE, allowNull: true }
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
				if (this.actual_end_time && this.actual_start_time && !(this.actual_end_time > this.actual_start_time)) {
					throw new Error('actual_end_time must be greater than actual_start_time');
				}
			}
		},
		scopes: {
			bySchedule(scheduleId) { return { where: { schedule_id: scheduleId } }; },
			onDate(date) { return { where: { trip_date: date } }; },
			withStatus(status) { return { where: { status } }; },
			current() { return { where: { status: ['SCHEDULED', 'IN_PROGRESS'] } }; }
		},
		indexes: [
			{ name: 'idx_trips_status_date', fields: ['status', 'trip_date'] },
			{ name: 'idx_trips_schedule_date', fields: ['schedule_id', 'trip_date'] }
		]
	});

	return Trip;
};
