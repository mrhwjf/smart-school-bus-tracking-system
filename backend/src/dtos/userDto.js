// User DTO constructor (plain function) to ensure password_hash is never exposed
module.exports = function toUserDTO(userInstance) {
	if (!userInstance) return null;
	const u = userInstance.get ? userInstance.get({ plain: true }) : userInstance;
	const { password_hash, ...rest } = u; // exclude password_hash
	return rest;
};
