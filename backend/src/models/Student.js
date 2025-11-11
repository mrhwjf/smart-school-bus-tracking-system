module.exports = (sequelize, DataTypes) => {
	const Student = sequelize.define('Student', {
		student_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		parent_id: { type: DataTypes.INTEGER, allowNull: true },
		class_id: { type: DataTypes.INTEGER, allowNull: true },
		name: { type: DataTypes.STRING(255), allowNull: false, validate: { len: [1, 255] } },
		gender: { type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'), allowNull: true },
		date_of_birth: { type: DataTypes.DATEONLY, allowNull: true }
	}, {
		tableName: 'students',
		underscored: true,
		freezeTableName: true,
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at',
		charset: 'utf8mb4',
		indexes: [
			{ name: 'idx_students_parent_id', fields: ['parent_id'] },
			{ name: 'idx_students_class_id', fields: ['class_id'] }
		]
	});

	// Normalize and sanitize name
	Student.addHook('beforeValidate', (student) => {
		if (student && student.name) {
			student.name = String(student.name).trim();
		}
	});

	return Student;
};
