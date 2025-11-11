module.exports = (sequelize, DataTypes) => {
	const ScheduleDay = sequelize.define('ScheduleDay', {
		schedule_id: { type: DataTypes.INTEGER, primaryKey: true },
		day_of_week: { type: DataTypes.ENUM('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'), primaryKey: true }
	}, {
		tableName: 'schedule_days',
		underscored: true,
		freezeTableName: true,
		timestamps: false,
		charset: 'utf8mb4'
	});

	return ScheduleDay;
};
