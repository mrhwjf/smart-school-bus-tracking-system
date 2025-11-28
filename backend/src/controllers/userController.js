const { userService } = require('../services');

// Roles
async function listRoles(req, res, next) {
	try {
		const { page = 0, size = 10 } = req.query;
		const result = await userService.listRoles({ page: Number(page), pageSize: Number(size) });
		res.json(result);
	} catch (err) { next(err); }
}

async function getRole(req, res, next) {
	try {
		const { roleId } = req.params;
		const result = await userService.getRoleById(Number(roleId));
		const status = result.success ? 200 : 404;
		res.status(status).json(result);
	} catch (err) { next(err); }
}

async function createRole(req, res, next) {
	try {
		const result = await userService.createRole(req.body);
		res.status(201).json(result);
	} catch (err) { next(err); }
}

async function updateRole(req, res, next) {
	try {
		const { roleId } = req.params;
		const result = await userService.updateRole(Number(roleId), req.body);
		const status = result.success ? 200 : 404;
		res.status(status).json(result);
	} catch (err) { next(err); }
}

async function deleteRole(req, res, next) {
	try {
		const { roleId } = req.params;
		const result = await userService.deleteRole(Number(roleId));
		res.json(result);
	} catch (err) { next(err); }
}

// Users
async function listUsers(req, res, next) {
	try {
		const { page = 0, size = 10, roleId, locked } = req.query;
		const filter = {};
		if (roleId) filter.role_id = Number(roleId);
		if (locked !== undefined) filter.locked = locked === 'true' || locked === true;
		const result = await userService.listUsers({ filter, page: Number(page), pageSize: Number(size) });
		res.json(result);
	} catch (err) { next(err); }
}

async function getUser(req, res, next) {
	try {
		const { userId } = req.params;
		const result = await userService.getUserById(Number(userId));
		const status = result.success ? 200 : 404;
		res.status(status).json(result);
	} catch (err) { next(err); }
}

async function createUser(req, res, next) {
	try {
		const result = await userService.createUser(req.body);
		res.status(201).json(result);
	} catch (err) { next(err); }
}

async function updateUser(req, res, next) {
	try {
		const { userId } = req.params;
		const result = await userService.updateUser(Number(userId), req.body);
		const status = result.success ? 200 : 404;
		res.status(status).json(result);
	} catch (err) { next(err); }
}

async function deleteUser(req, res, next) {
	try {
		const { userId } = req.params;
		const result = await userService.deleteUser(Number(userId));
		res.json(result);
	} catch (err) { next(err); }
}

// Drivers
async function listDrivers(req, res, next) {
	try {
		const { page = 0, size = 10, vehicleType, available } = req.query;
		const filter = {};
		if (vehicleType) filter.vehicle_type = vehicleType;
		if (available !== undefined) filter.available = available === 'true' || available === true;
		const result = await userService.listDrivers({ filter, page: Number(page), pageSize: Number(size) });
		res.json(result);
	} catch (err) { next(err); }
}

// Parents
async function listParents(req, res, next) {
	try {
		const { page = 0, size = 10 } = req.query;
		const result = await userService.listParents({ page: Number(page), pageSize: Number(size) });
		res.json(result);
	} catch (err) { next(err); }
};

module.exports = {
	// Roles
	listRoles, getRole, createRole, updateRole, deleteRole,
	// Users
	listUsers, getUser, createUser, updateUser, deleteUser,
	// Drivers
	listDrivers,
	// Parents
	listParents
};