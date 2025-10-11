module.exports = (sequelize, DataTypes) => {
	const NavigationLog = sequelize.define('NavigationLog', {
		update_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		bus_id: { type: DataTypes.INTEGER, allowNull: false },
		latitude: { type: DataTypes.DECIMAL(10, 8) },
		longitude: { type: DataTypes.DECIMAL(11, 8) },
		recorded_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	}, {
		tableName: 'navigation_logs',
		timestamps: false,
		indexes: [{ fields: ['bus_id'], name: 'idx_nav_bus' }]
	});

	return NavigationLog;
};
