const crypto = require('crypto');
const { hashPassword } = require('../utils/hash');
const apiResponse = require('../utils/apiResponse');
const createPagination = require('../utils/pagination');
const {
	toRoleDto,
	toUserDto,
	toParentDto,
	toDriverDto,
} = require('../dtos');

const {
	RoleRepository,
	UserRepository,
} = require('../repositories');

// function hashPassword(plain) {
// 	if (!plain) return null;
// 	return crypto.createHash('sha256').update(String(plain)).digest('hex');
// }

// Roles
async function listRoles({ filter = {}, sort, page = 0, pageSize = 10 } = {}, options = {}) {
	const { rows, count, page: p, pageSize: s, totalPages } = await RoleRepository.list({ filter, sort, page, pageSize }, options);
	const items = (rows || []).map(toRoleDto);
	const data = createPagination({ items, page: p, size: s, totalElements: count, totalPages });
	return apiResponse.success('Roles fetched successfully', data);
}

async function getRoleById(roleId, options = {}) {
	const role = await RoleRepository.findById(roleId, options);
	if (!role) return apiResponse.failure('Role not found');
	return apiResponse.success('Role fetched successfully', toRoleDto(role));
}

async function createRole(data, options = {}) {
	const created = await RoleRepository.create({ name: data.name, description: data.description }, options);
	return apiResponse.success('Role created successfully', toRoleDto(created));
}

async function updateRole(roleId, changes, options = {}) {
	const updated = await RoleRepository.updateById(roleId, { name: changes.name, description: changes.description }, options);
	if (!updated) return apiResponse.failure('Role not found');
	return apiResponse.success('Role updated successfully', toRoleDto(updated));
}

async function deleteRole(roleId, options = {}) {
	const deleted = await RoleRepository.deleteById(roleId, options);
	return apiResponse.success('Role deleted successfully', { deleted });
}

// Users
async function listUsers({ filter = {}, sort, page = 0, pageSize = 10 } = {}, options = {}) {
	const { rows, count, page: p, pageSize: s, totalPages } = await UserRepository.list({ filter, sort, page, pageSize }, options);
	const items = (rows || []).map(toUserDto);
	const data = createPagination({ items, page: p, size: s, totalElements: count, totalPages });
	return apiResponse.success('Users fetched successfully', data);
}

async function getUserById(userId, options = {}) {
	const user = await UserRepository.findById(userId, options);
	if (!user) return apiResponse.failure('User not found');
	return apiResponse.success('User fetched successfully', toUserDto(user));
}

async function createUser(data, options = {}) {
	const toCreate = {
		role_id: data.roleId,
		name: data.name,
		phone_number: data.phoneNumber,
		email: data.email,
		password_hash: await hashPassword(data.password),
		locked: data.locked,
	};
	const created = await UserRepository.create(toCreate, options);
	return apiResponse.success('User created successfully', toUserDto(created));
}

async function updateUser(userId, changes, options = {}) {
	const patch = {
		role_id: changes.roleId,
		name: changes.name,
		phone_number: changes.phoneNumber,
		email: changes.email,
		locked: changes.locked,
	};
	if (changes.password) patch.password_hash = hashPassword(changes.password);
	const updated = await UserRepository.updateById(userId, patch, options);
	if (!updated) return apiResponse.failure('User not found');
	return apiResponse.success('User updated successfully', toUserDto(updated));
}

async function deleteUser(userId, options = {}) {
	const deleted = await UserRepository.deleteById(userId, options);
	return apiResponse.success('User deleted successfully', { deleted });
}

// Parents
async function listParents({ filter = {}, sort, page = 0, pageSize = 10 } = {}, options = {}) {
	const { rows, count, page: p, pageSize: s, totalPages } = await UserRepository.listParents({ filter, sort, page, pageSize }, options);
	const items = (rows || []).map(toUserDto);
	const data = createPagination({ items, page: p, size: s, totalElements: count, totalPages });
	return apiResponse.success('Parents fetched successfully', data);
}

// Drivers
async function listDrivers({ filter = {}, sort, page = 0, pageSize = 10 } = {}, options = {}) {
	const { rows, count, page: p, pageSize: s, totalPages } = await UserRepository.listDrivers({ filter, sort, page, pageSize }, options);
	const items = (rows || []).map(toUserDto);
	const data = createPagination({ items, page: p, size: s, totalElements: count, totalPages });
	return apiResponse.success('Drivers fetched successfully', data);
}

module.exports = {
	// Roles
	listRoles, getRoleById, createRole, updateRole, deleteRole,
	// Users
	listUsers, getUserById, createUser, updateUser, deleteUser,
	// Parents
	listParents,
	// Drivers
	listDrivers
};
