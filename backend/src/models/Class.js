module.exports = (sequelize, DataTypes) => {
	const Class = sequelize.define('Class', {
		class_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		name: { type: DataTypes.STRING(50), unique: true, allowNull: false }
	}, {
		tableName: 'classes',
		underscored: true,
		freezeTableName: true,
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at',
		charset: 'utf8mb4'
	});

	return Class;
};
