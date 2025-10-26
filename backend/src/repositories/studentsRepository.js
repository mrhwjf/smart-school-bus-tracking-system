const BaseRepository = require('./baseRepository');
const db = require('../models');
const { Op } = require('sequelize');

class StudentsRepository extends BaseRepository {
	constructor() {
		super(db.Student, { sortableFields: ['created_at', 'updated_at', 'student_id', 'name', 'class'] });
	}

	buildWhere(filter = {}) {
		const where = {};
		const { student_id, parent_id, name, gender, class: className, date_of_birth, q } = filter;
		if (student_id) where.student_id = student_id;
		if (parent_id) where.parent_id = parent_id;
		if (name) where.name = name;
		if (gender) where.gender = gender;
		if (className) where.class = className;
		if (date_of_birth) where.date_of_birth = date_of_birth;
		if (q) {
			where[Op.or] = [
				{ name: { [Op.like]: `%${q}%` } },
				{ class: { [Op.like]: `%${q}%` } },
			];
		}
		return where;
	}
}

module.exports = new StudentsRepository();
