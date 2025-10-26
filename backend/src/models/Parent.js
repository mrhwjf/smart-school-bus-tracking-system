module.exports = (sequelize, DataTypes) => {
	const Parent = sequelize.define('Parent', {
		parent_id: { type: DataTypes.INTEGER, primaryKey: true },
		relationship: { type: DataTypes.ENUM('PARENT', 'GUARDIAN', 'RELATIVE'), defaultValue: 'PARENT' }
	}, {
		tableName: 'parents',
		underscored: true,
		freezeTableName: true,
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: false,
		charset: 'utf8mb4'
	});

	return Parent;
};
