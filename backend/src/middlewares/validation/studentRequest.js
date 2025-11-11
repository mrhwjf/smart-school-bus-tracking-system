const { body, param, query } = require('express-validator');
const { GENDER } = require('../../config/constants');
const { ClassRepository, UserRepository } = require('../../repositories');

const createStudentRequest = [
	body('parentId')
		.isInt({ min: 1 }).toInt()
		.bail()
		.custom(async (parentId) => {
			const user = await UserRepository.findById(parentId);
			if (!user || !user.Parent) {
				return Promise.reject('parentId must reference an existing parent');
			}
		}),
	body('name').isString().trim().notEmpty().isLength({ max: 255 }),
	body('classId')
		.isInt({ min: 1 }).toInt()
		.bail()
		.custom(async (classId) => {
			const cls = await ClassRepository.findById(classId);
			if (!cls) return Promise.reject('classId must reference an existing class');
		}),
	body('gender').optional().isIn(GENDER),
	body('dateOfBirth').optional().isISO8601().toDate(),
];

const updateStudentRequest = [
	param('studentId').isInt({ min: 1 }).toInt(),
	body('parentId')
		.optional()
		.isInt({ min: 1 }).toInt()
		.bail()
		.custom(async (parentId) => {
			if (parentId == null) return true;
			const user = await UserRepository.findById(parentId);
			if (!user || !user.Parent) {
				return Promise.reject('parentId must reference an existing parent');
			}
		}),
	body('name').optional().isString().trim().isLength({ max: 255 }),
	body('classId')
		.optional()
		.isInt({ min: 1 }).toInt()
		.bail()
		.custom(async (classId) => {
			if (classId == null) return true;
			const cls = await ClassRepository.findById(classId);
			if (!cls) return Promise.reject('classId must reference an existing class');
		}),
	body('gender').optional().isIn(GENDER),
	body('dateOfBirth').optional().isISO8601().toDate(),
];

const listStudentsQuery = [
	query('name').optional().isString().trim().isLength({ max: 255 }),
	query('parentId').optional().isInt({ min: 1 }).toInt(),
	query('classId').optional().isInt({ min: 1 }).toInt(),
	query('page').optional().isInt({ min: 0 }).toInt(),
	query('size').optional().isInt({ min: 1, max: 100 }).toInt(),
	query('sortField').optional().isIn(['student_id', 'name', 'created_at']).toLowerCase(),
	query('sortDirection').optional().isIn(['ASC', 'DESC', 'asc', 'desc']).customSanitizer(v => String(v).toUpperCase()),
];

module.exports = { createStudentRequest, updateStudentRequest, listStudentsQuery };
