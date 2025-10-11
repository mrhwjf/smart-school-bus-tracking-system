module.exports = (sequelize, DataTypes) => {
	const Student = sequelize.define('Student', {
		student_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		parent_id: { type: DataTypes.INTEGER, allowNull: false },
		name: { type: DataTypes.STRING(255), allowNull: false },
		class: { type: DataTypes.STRING(50) },
		gender: { type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER') },
		date_of_birth: { type: DataTypes.DATEONLY },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	}, {
		tableName: 'students',
		timestamps: false,
		indexes: [{ fields: ['parent_id'], name: 'idx_parent_id' }]
	});

	return Student;
};
