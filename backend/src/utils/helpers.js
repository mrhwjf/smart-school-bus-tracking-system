function asyncHandler(fn) {
	return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function iso(date) {
	return date ? new Date(date).toISOString() : null;
}

function createHttpError(status, message) {
	const err = new Error(message || 'Error');
	err.status = status || 500;
	return err;
}

function calculateAge(dateOfBirth) {
	if (!dateOfBirth) return null;
	const dob = new Date(dateOfBirth);
	if (Number.isNaN(dob.getTime())) return null;
	const today = new Date();
	let age = today.getFullYear() - dob.getFullYear();
	const m = today.getMonth() - dob.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
	return age;
}

module.exports = {
	asyncHandler,
	iso,
	createHttpError,
	calculateAge
};