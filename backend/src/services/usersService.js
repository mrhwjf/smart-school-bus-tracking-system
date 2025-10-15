const bcrypt = require('bcryptjs');
const repo = require('../repositories/usersRepository');
const rolesRepo = require('../repositories/rolesRepository');
const mapper = require('../mappers/userMapper');
const createHttpError = require('../utils/httpError');

const SALT_ROUNDS = 10;

module.exports = {
	async list() {
		const users = await repo.findAll();
		return mapper.toDTOList(users);
	},

	async get(id) {
		const user = await repo.findById(id);
		if (!user) throw createHttpError(404, 'User not found');
		return mapper.toDTO(user);
	},

	async create(payload) {
		const { role_id, name, email, phone_number, password, is_active } = payload;
		if (!role_id) throw createHttpError(400, 'role_id is required');
		if (!name) throw createHttpError(400, 'name is required');
		if (!password) throw createHttpError(400, 'password is required');

		// optional: verify role exists
		const role = await rolesRepo.findById(role_id);
		if (!role) throw createHttpError(400, 'Invalid role_id');

		const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

		try {
			const created = await repo.create({ role_id, name, email, phone_number, password_hash, is_active });
			return mapper.toDTO(created);
		} catch (err) {
			if (err.name === 'SequelizeUniqueConstraintError') {
				throw createHttpError(409, 'Email or phone number already exists');
			}
			throw err;
		}
	},

	async update(id, payload) {
		const user = await repo.findById(id);
		if (!user) throw createHttpError(404, 'User not found');

		const updates = { ...payload };
		if (updates.password) {
			updates.password_hash = await bcrypt.hash(updates.password, SALT_ROUNDS);
			delete updates.password;
		}
		if (updates.role_id) {
			const role = await rolesRepo.findById(updates.role_id);
			if (!role) throw createHttpError(400, 'Invalid role_id');
		}

		delete updates.user_id; // never allow changing pk
		delete updates.password_hash; // prevent manual injection

		try {
			const updated = await repo.update(id, updates);
			return mapper.toDTO(updated);
		} catch (err) {
			if (err.name === 'SequelizeUniqueConstraintError') {
				throw createHttpError(409, 'Email or phone number already exists');
			}
			throw err;
		}
	},

	async remove(id) {
		const deleted = await repo.remove(id);
		if (!deleted) throw createHttpError(404, 'User not found');
	}
};
