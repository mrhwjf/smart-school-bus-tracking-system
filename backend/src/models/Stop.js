module.exports = (sequelize, DataTypes) => {
	const Stop = sequelize.define('Stop', {
		stop_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		name: { type: DataTypes.STRING(255), allowNull: false },
		latitude: { type: DataTypes.DECIMAL(10, 8), allowNull: false, validate: { min: -90, max: 90 } },
		longitude: { type: DataTypes.DECIMAL(11, 8), allowNull: false, validate: { min: -180, max: 180 } },
		address: { type: DataTypes.STRING(255), allowNull: true },
		active: { type: DataTypes.BOOLEAN, defaultValue: true }
	}, {
		tableName: 'stops',
		underscored: true,
		freezeTableName: true,
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at',
		charset: 'utf8mb4',
		validate: {
			validCoordinates() {
				if (this.latitude < -90 || this.latitude > 90) throw new Error('latitude out of range');
				if (this.longitude < -180 || this.longitude > 180) throw new Error('longitude out of range');
			}
		}
	});

	// Normalize inputs
	Stop.addHook('beforeValidate', (stop) => {
		if (stop && stop.name) stop.name = String(stop.name).trim();
		if (stop && stop.address) stop.address = String(stop.address).trim();
	});

	return Stop;
};
