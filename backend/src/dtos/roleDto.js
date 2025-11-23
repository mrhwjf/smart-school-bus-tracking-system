function toRoleDto(role) {
	if (!role) return null;
	return {
		roleId: role.role_id,
		name: role.name,
		description: role.description || null,
	};
}

module.exports = { toRoleDto };
