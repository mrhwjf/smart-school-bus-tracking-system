function toClassDto(obj) {
	return {
		classId: obj.class_id,
		name: obj.name,
	};
}

module.exports = { toClassDto };
