module.exports = (sequelize, DataTypes) => {
	const Parent = sequelize.define('Parent', {
		parent_id: { type: DataTypes.INTEGER, primaryKey: true },
		relationship: { type: DataTypes.ENUM('PARENTS', 'GUARDIANS', 'RELATIVES'), defaultValue: 'PARENTS' },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	}, {
		tableName: 'parents',
		timestamps: false
	});

	return Parent;
};
