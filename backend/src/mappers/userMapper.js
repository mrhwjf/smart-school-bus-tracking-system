const toUserDTO = require('../dtos/userDto');

module.exports = {
	toDTO: toUserDTO,
	toDTOList(list) { return Array.isArray(list) ? list.map(toUserDTO) : []; }
};
