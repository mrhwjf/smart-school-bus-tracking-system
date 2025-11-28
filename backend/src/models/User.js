module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define('User', {
		user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		role_id: { type: DataTypes.INTEGER, allowNull: false },
		name: {
			type: DataTypes.STRING(255),
			allowNull: false,
			validate: { len: [1, 255] }
		},
		phone_number: {
			type: DataTypes.STRING(20),
			allowNull: true,
			unique: true,
			validate: { len: [0, 20] }
		},
		email: {
			type: DataTypes.STRING(255),
			allowNull: true,
			unique: true,
			validate: { isEmail: true }
		},
		password_hash: { type: DataTypes.STRING(255), allowNull: false },
		locked: { type: DataTypes.BOOLEAN, allowNull: true }
	}, {
		tableName: 'users',
		underscored: true,
		freezeTableName: true,
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at',
		charset: 'utf8mb4',
		defaultScope: {
			attributes: { exclude: ['password_hash'] }
		},
		scopes: {
			byRoleId(roleId) { return { where: { role_id: roleId } }; },
			byEmail(email) { return { where: { email } }; },
			byPhoneNumber(phoneNumber) { return { where: { phone_number: phoneNumber } }; },
			locked() { return { where: { locked: true } }; },
			withPassword: {
				attributes: { include: ['password_hash'] }
			}
		},
		indexes: [
			{ name: 'idx_users_role_id', fields: ['role_id'] }
		]
	});

	// Normalize and sanitize
	User.addHook('beforeValidate', (user) => {
		if (user.email) user.email = String(user.email).trim().toLowerCase();
		if (user.name) user.name = String(user.name).trim();
		if (user.phone_number) user.phone_number = String(user.phone_number).trim();
	});

	// Hide sensitive fields in JSON
	User.prototype.toJSON = function () {
		const values = { ...this.get() };
		delete values.password_hash;
		return values;
	};

	return User;
};
