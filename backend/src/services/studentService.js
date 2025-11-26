const apiResponse = require('../utils/apiResponse');
const createPagination = require('../utils/pagination');
const { toStudentDto, toClassDto } = require('../dtos');
const { StudentRepository, ClassRepository, UserRepository } = require('../repositories');

async function listStudents({ filter = {}, sort, page = 0, pageSize = 10 } = {}, options = {}) {
	const { rows, count, page: p, pageSize: s, totalPages } = await StudentRepository.list({ filter, sort, page, pageSize }, options);
	const items = (rows || []).map(toStudentDto);
	const data = createPagination({ items, page: p, size: s, totalElements: count, totalPages });
	return apiResponse.success('Students fetched successfully', data);
}

async function getStudentById(studentId, options = {}) {
	const student = await StudentRepository.findById(studentId, options);
	if (!student) return apiResponse.failure('Student not found');
	return apiResponse.success('Student fetched successfully', toStudentDto(student));
}

async function createStudent(data, options = {}) {
	const created = await StudentRepository.create({
		parent_id: data.parentId,
		name: data.name,
		class_id: data.classId,
		gender: data.gender,
		date_of_birth: data.dateOfBirth,
	}, options);
	return apiResponse.success('Student created successfully', toStudentDto(created));
}

async function updateStudent(studentId, changes, options = {}) {
	const updated = await StudentRepository.updateById(studentId, {
		parent_id: changes.parentId,
		name: changes.name,
		class_id: changes.classId,
		gender: changes.gender,
		date_of_birth: changes.dateOfBirth,
	}, options);
	if (!updated) return apiResponse.failure('Student not found');
	return apiResponse.success('Student updated successfully', toStudentDto(updated));
}

async function deleteStudent(studentId, options = {}) {
	const deleted = await StudentRepository.deleteById(studentId, options);
	return apiResponse.success('Student deleted successfully', { deleted });
}

async function bulkDeleteStudents(where = {}, options = {}) {
	const deletedCount = await StudentRepository.bulkDelete(where, options);
	return apiResponse.success('Students deleted successfully', { deletedCount });
}

async function listClassesForDropdown(options = {}) {
	const { rows } = await ClassRepository.list({}, options);
	const items = (rows || []).map(toClassDto);
	return apiResponse.success('Classes fetched successfully', items);
}

async function listParentsForDropdown(options = {}) {
	const { rows } = await UserRepository.listParentsForDropdown(options);
	const items = (rows || []).map(parent => {
		return {
			userId: parent.user_id,
			name: parent.name
		};
	});
	return apiResponse.success('Parents fetched successfully', items);
}

module.exports = {
	listStudents,
	listClassesForDropdown,
	listParentsForDropdown,
	getStudentById,
	createStudent,
	updateStudent,
	deleteStudent,
	bulkDeleteStudents
};
