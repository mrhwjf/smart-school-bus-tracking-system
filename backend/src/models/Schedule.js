module.exports = (sequelize, DataTypes) => {
	const Schedule = sequelize.define('Schedule', {
		schedule_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		route_id: { type: DataTypes.INTEGER, allowNull: false },
		bus_id: { type: DataTypes.INTEGER, allowNull: false },
		driver_id: { type: DataTypes.INTEGER, allowNull: false },
		shift: { type: DataTypes.ENUM('MORNING', 'AFTERNOON'), defaultValue: 'MORNING' },
		start_time: { type: DataTypes.TIME, allowNull: false },
		end_time: { type: DataTypes.TIME, allowNull: false },
		active: { type: DataTypes.BOOLEAN, defaultValue: true }
	}, {
		tableName: 'schedules',
		underscored: true,
		freezeTableName: true,
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at',
		charset: 'utf8mb4',
	});

	return Schedule;
};
