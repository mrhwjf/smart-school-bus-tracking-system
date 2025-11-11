module.exports = (sequelize, DataTypes) => {
	const RoutePassenger = sequelize.define('RoutePassenger', {
		route_id: { type: DataTypes.INTEGER, primaryKey: true },
		student_id: { type: DataTypes.INTEGER, primaryKey: true }
	}, {
		tableName: 'route_passengers',
		underscored: true,
		freezeTableName: true,
		timestamps: false,
		charset: 'utf8mb4',
		indexes: [
			{ name: 'idx_tp_student', fields: ['student_id'] }
		]
	});

	return RoutePassenger;
};
