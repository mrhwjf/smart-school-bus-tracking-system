// Should be wrapped in apiResponse.js (field: data)

const createPagination = ({ items, page, size, totalElements, totalPages }) => ({
	items: items || [],
	page: page || 0,
	size: size || 0,
	totalElements: totalElements || 0,
	totalPages: totalPages || 0,
	hasNext: page + 1 < totalPages,
	hasPrevious: page > 0,
});

module.exports = createPagination;