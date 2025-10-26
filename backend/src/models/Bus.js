module.exports = (sequelize, DataTypes) => {
	const Bus = sequelize.define('Bus', {
		bus_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		driver_id: { type: DataTypes.INTEGER, allowNull: true },
		plate_number: { type: DataTypes.STRING(20), allowNull: false, unique: true },
		model: { type: DataTypes.STRING(100), allowNull: true },
		status: { type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'OUT_OF_SERVICE'), defaultValue: 'ACTIVE' },
		capacity: { type: DataTypes.INTEGER, defaultValue: 0 }
	}, {
		tableName: 'buses',
		underscored: true,
		freezeTableName: true,
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at',
		charset: 'utf8mb4',
		scopes: {
			active() { return { where: { status: 'ACTIVE' } }; },
			byDriver(driverId) { return { where: { driver_id: driverId } }; }
		},
		indexes: [
			{ name: 'idx_driver_id', fields: ['driver_id'] }
		]
	});

	return Bus;
};
