const { studentService } = require('../services');

async function listStudents(req, res, next) {
	try {
		const { page = 0, size = 10, parentId, classId, name, sortField, sortDirection } = req.query;
		const filter = {};
		if (parentId) filter.parent_id = Number(parentId);
		if (classId) filter.class_id = Number(classId);
		if (name) filter.name = String(name);
		const allowedSortFields = ['student_id', 'name', 'created_at'];
		const sort = sortField && allowedSortFields.includes(sortField)
			? { field: sortField, direction: sortDirection === 'DESC' ? 'DESC' : 'ASC' }
			: undefined;
		const result = await studentService.listStudents({ filter, sort, page: Number(page), pageSize: Number(size) });
		res.json(result);
	} catch (err) { next(err); }
}

async function getStudent(req, res, next) {
	try {
		const { studentId } = req.params;
		const result = await studentService.getStudentById(Number(studentId));
		const status = result.success ? 200 : 404;
		res.status(status).json(result);
	} catch (err) { next(err); }
}

async function createStudent(req, res, next) {
	try {
		const result = await studentService.createStudent(req.body);
		res.status(201).json(result);
	} catch (err) { next(err); }
}

async function updateStudent(req, res, next) {
	try {
		const { studentId } = req.params;
		const result = await studentService.updateStudent(Number(studentId), req.body);
		const status = result.success ? 200 : 404;
		res.status(status).json(result);
	} catch (err) { next(err); }
}

async function deleteStudent(req, res, next) {
	try {
		const { studentId } = req.params;
		const result = await studentService.deleteStudent(Number(studentId));
		res.json(result);
	} catch (err) { next(err); }
}

module.exports = { listStudents, getStudent, createStudent, updateStudent, deleteStudent };
