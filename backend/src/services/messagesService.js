const repo = require('../repositories/messagesRepository');
const createHttpError = require('../utils/httpError');

module.exports = {
	list() { return repo.findAll(); },
	async get(id) { const m = await repo.findById(id); if (!m) throw createHttpError(404, 'Message not found'); return m; },
	async create(payload) {
		const { message_text } = payload;
		if (!message_text) throw createHttpError(400, 'message_text is required');
		return repo.create({ message_text });
	},
	async update(id, payload) {
		const updated = await repo.update(id, payload);
		if (!updated) throw createHttpError(404, 'Message not found');
		return updated;
	},
	async remove(id) { const deleted = await repo.remove(id); if (!deleted) throw createHttpError(404, 'Message not found'); }
};
