module.exports = (sequelize, DataTypes) => {
	const Driver = sequelize.define('Driver', {
		driver_id: { type: DataTypes.INTEGER, primaryKey: true },
		license_number: { type: DataTypes.STRING(50), allowNull: false, unique: true },
		vehicle_permit: { type: DataTypes.STRING(100) },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	}, {
		tableName: 'drivers',
		timestamps: false
	});

	return Driver;
};
