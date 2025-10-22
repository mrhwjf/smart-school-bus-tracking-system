const service = require('../services/driversService');
const asyncHandler = require('../utils/asyncHandler');

module.exports = {
	list: asyncHandler(async (req, res) => {
		const items = await service.list();
		res.json(items);
	}),

	get: asyncHandler(async (req, res) => {
		const item = await service.get(req.params.id);
		res.json(item);
	}),

	create: asyncHandler(async (req, res) => {
		const created = await service.create(req.body);
		res.status(201).json(created);
	}),

	update: asyncHandler(async (req, res) => {
		const updated = await service.update(req.params.id, req.body);
		res.json(updated);
	}),

	remove: asyncHandler(async (req, res) => {
		await service.remove(req.params.id);
		res.status(204).send();
	})
};
