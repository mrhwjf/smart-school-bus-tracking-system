module.exports = (sequelize, DataTypes) => {
	const Stop = sequelize.define('Stop', {
		stop_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		route_id: { type: DataTypes.INTEGER, allowNull: false },
		name: { type: DataTypes.STRING(255), allowNull: false },
		latitude: { type: DataTypes.DECIMAL(10, 8) },
		longitude: { type: DataTypes.DECIMAL(11, 8) },
		address: { type: DataTypes.STRING(255) },
		seq_index: { type: DataTypes.INTEGER, defaultValue: 0 },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	}, {
		tableName: 'stops',
		timestamps: false,
		indexes: [{ fields: ['route_id'], name: 'idx_route_id' }]
	});

	return Stop;
};
