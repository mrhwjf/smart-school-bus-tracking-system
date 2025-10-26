module.exports = (sequelize, DataTypes) => {
	const Stop = sequelize.define('Stop', {
		stop_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		route_id: { type: DataTypes.INTEGER, allowNull: false },
		name: { type: DataTypes.STRING(255), allowNull: false },
		latitude: { type: DataTypes.DECIMAL(10, 8), allowNull: true, validate: { min: -90, max: 90 } },
		longitude: { type: DataTypes.DECIMAL(11, 8), allowNull: true, validate: { min: -180, max: 180 } },
		address: { type: DataTypes.STRING(255), allowNull: true },
		seq_index: { type: DataTypes.INTEGER, defaultValue: 0 }
	}, {
		tableName: 'stops',
		underscored: true,
		freezeTableName: true,
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at',
		charset: 'utf8mb4',
		scopes: {
			byRoute(routeId) { return { where: { route_id: routeId } }; },
			ordered() { return { order: [['seq_index', 'ASC']] }; }
		},
		indexes: [
			{ name: 'idx_route_id', fields: ['route_id'] },
			{ name: 'idx_stops_route_seq', fields: ['route_id', 'seq_index'] }
		]
	});

	return Stop;
};
