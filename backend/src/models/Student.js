module.exports = (sequelize, DataTypes) => {
	const Student = sequelize.define('Student', {
		student_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		parent_id: { type: DataTypes.INTEGER, allowNull: false },
		name: { type: DataTypes.STRING(255), allowNull: false, validate: { len: [1, 255] } },
		class: { type: DataTypes.STRING(50), allowNull: true },
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
			{ name: 'idx_parent_id', fields: ['parent_id'] }
		]
	});

	return Student;
};
