const { toClassDto } = require('./classDto');
const { toUserDto } = require('./userDto');
const { calculateAge } = require('../utils/helpers');

function toStudentDto(student) {
	if (!student) return null;
	return {
		studentId: student.student_id,
		parentId: student.parent_id,
		classId: student.class_id,
		name: student.name,
		class: student.Class ? toClassDto(student.Class) : undefined,
		gender: student.gender || null,
		dateOfBirth: student.date_of_birth || null,
		age: calculateAge(student.date_of_birth),
		parent: student.Parent?.User ? toUserDto(student.Parent.User) : undefined
	};
}

module.exports = { toStudentDto };
