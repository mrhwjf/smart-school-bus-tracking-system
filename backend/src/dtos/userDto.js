const { toDriverDto } = require("./driverDto");
const { toParentDto } = require("./parentDto");
const { toRoleDto } = require("./roleDto");

function toUserDto(user) {
	if (!user) return null;
	return {
		userId: user.user_id,
		roleId: user.role_id,
		name: user.name,
		phoneNumber: user.phone_number || null,
		email: user.email || null,
		locked: user.locked === true,
		role: user.Role ? toRoleDto(user.Role) : undefined,
		parentInfo: user.Parent ? toParentDto(user.Parent) : undefined,
		driverInfo: user.Driver ? toDriverDto(user.Driver) : undefined
	};
}

module.exports = { toUserDto };
