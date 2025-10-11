module.exports = (sequelize, DataTypes) => {
	const Bus = sequelize.define('Bus', {
		bus_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		driver_id: { type: DataTypes.INTEGER },
		plate_number: { type: DataTypes.STRING(20), allowNull: false, unique: true },
		model: { type: DataTypes.STRING(100) },
		status: { type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'OUT_OF_SERVICE'), defaultValue: 'ACTIVE' },
		capacity: { type: DataTypes.INTEGER, defaultValue: 0 },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	}, {
		tableName: 'buses',
		timestamps: false,
		indexes: [{ fields: ['driver_id'], name: 'idx_driver_id' }]
	});

	return Bus;
};
