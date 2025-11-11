module.exports = (sequelize, DataTypes) => {
	const Bus = sequelize.define('Bus', {
		bus_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
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
			byStatus(status) { return { where: { status } }; },
		}
	});

	// Normalize inputs
	Bus.addHook('beforeValidate', (bus) => {
		if (bus && bus.plate_number) bus.plate_number = String(bus.plate_number).trim();
		if (bus && bus.model) bus.model = String(bus.model).trim();
	});

	return Bus;
};
