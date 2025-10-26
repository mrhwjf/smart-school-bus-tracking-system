/*
 BaseRepository: shared data-access helpers for Sequelize models.
 Implements standard CRUD and list with filtering, sorting, pagination.
 Follow coding patterns from .github/copilot-instruction.md.
*/

const { Op } = require('sequelize');

class BaseRepository {
	constructor(model, options = {}) {
		if (!model) throw new Error('BaseRepository requires a Sequelize model');
		this.model = model;
		this.primaryKey = Object.keys(model.primaryKeys || {})[0] || `${model.name.toLowerCase()}_id`;
		this.sortableFields = options.sortableFields || ['created_at', this.primaryKey];
	}

	// Whitelist/filter builder; override in subclass for custom logic and type coercion
	buildWhere(filter = {}) {
		if (!filter || typeof filter !== 'object') return {};
		const where = {};
		for (const [key, value] of Object.entries(filter)) {
			if (value === undefined || value === null || value === '') continue;
			// Allow exact match only by default
			where[key] = value;
		}
		return where;
	}

	// Sorting builder with allowlist
	buildOrder(sort = {}) {
		const field = sort.field && this.sortableFields.includes(sort.field) ? sort.field : (this.sortableFields[0] || this.primaryKey);
		const order = String(sort.order || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
		return [[field, order]];
	}

	// Pagination helper
	paginate(page = 1, pageSize = 20) {
		const p = Math.max(parseInt(page, 10) || 1, 1);
		const ps = Math.min(Math.max(parseInt(pageSize, 10) || 20, 1), 200);
		return { limit: ps, offset: (p - 1) * ps, page: p, pageSize: ps };
	}

	// Error mapper (keep simple unless project-specific error classes exist)
	mapError(err, context = {}) {
		// Attach context for logging; rethrow original to avoid losing information.
		err.context = { model: this.model.name, ...context };
		return err;
	}

	async findById(id, options = {}) {
		try {
			if (id && typeof id === 'object') {
				// composite key support
				return await this.model.findOne({ where: id, ...options });
			}
			return await this.model.findByPk(id, { ...options });
		} catch (err) {
			throw this.mapError(err, { op: 'findById', id });
		}
	}

	async findOne(where = {}, options = {}) {
		try {
			const whereObj = this.buildWhere(where);
			return await this.model.findOne({ where: whereObj, ...options });
		} catch (err) {
			throw this.mapError(err, { op: 'findOne', where });
		}
	}

	async list(params = {}, options = {}) {
		const { filter = {}, sort = {}, page = 1, pageSize = 20 } = params || {};
		try {
			const where = this.buildWhere(filter);
			const order = this.buildOrder(sort);
			const { limit, offset, page: p, pageSize: ps } = this.paginate(page, pageSize);

			const result = await this.model.findAndCountAll({
				where,
				order,
				limit,
				offset,
				distinct: true,
				...options,
			});

			const totalPages = Math.ceil(result.count / ps) || 0;
			return { rows: result.rows, count: result.count, page: p, pageSize: ps, totalPages };
		} catch (err) {
			throw this.mapError(err, { op: 'list', params });
		}
	}

	async create(data, options = {}) {
		try {
			return await this.model.create(data, { ...options });
		} catch (err) {
			throw this.mapError(err, { op: 'create', data });
		}
	}

	async bulkCreate(list, options = {}) {
		try {
			return await this.model.bulkCreate(list, { ...options });
		} catch (err) {
			throw this.mapError(err, { op: 'bulkCreate', size: Array.isArray(list) ? list.length : 0 });
		}
	}

	async updateById(id, changes, options = {}) {
		try {
			const where = (id && typeof id === 'object') ? id : { [this.primaryKey]: id };
			const [affected] = await this.model.update(changes, { where, ...options });
			return affected; // number of rows updated
		} catch (err) {
			throw this.mapError(err, { op: 'updateById', id, changes });
		}
	}

	async deleteById(id, options = {}) {
		try {
			const where = (id && typeof id === 'object') ? id : { [this.primaryKey]: id };
			const affected = await this.model.destroy({ where, ...options });
			return affected; // number of rows deleted
		} catch (err) {
			throw this.mapError(err, { op: 'deleteById', id });
		}
	}
}

module.exports = BaseRepository;
