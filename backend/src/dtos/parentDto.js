function toParentDto(parent) {
	if (!parent) return null;
	return {
		parentId: parent.parent_id,
		relationship: parent.relationship || 'PARENT',
	};
}

module.exports = { toParentDto };
