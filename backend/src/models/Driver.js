module.exports = (sequelize, DataTypes) => {
	const Driver = sequelize.define('Driver', {
		driver_id: { type: DataTypes.INTEGER, primaryKey: true },
		license_number: { type: DataTypes.STRING(50), allowNull: false, unique: true, validate: { len: [1, 50] } },
		vehicle_permit: { type: DataTypes.STRING(100), allowNull: true }
	}, {
		tableName: 'drivers',
		underscored: true,
		freezeTableName: true,
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at',
		charset: 'utf8mb4'
	});

	return Driver;
};
