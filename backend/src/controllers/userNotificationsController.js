const service = require('../services/userNotificationsService');
const asyncHandler = require('../utils/asyncHandler');

module.exports = {
	list: asyncHandler(async (req, res) => { res.json(await service.list()); }),
	get: asyncHandler(async (req, res) => { const { notification_id, recipient_id } = req.params; res.json(await service.get(notification_id, recipient_id)); }),
	create: asyncHandler(async (req, res) => { const created = await service.create(req.body); res.status(201).json(created); }),
	update: asyncHandler(async (req, res) => { const { notification_id, recipient_id } = req.params; const updated = await service.update(notification_id, recipient_id, req.body); res.json(updated); }),
	remove: asyncHandler(async (req, res) => { const { notification_id, recipient_id } = req.params; await service.remove(notification_id, recipient_id); res.status(204).send(); })
};
