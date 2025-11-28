function toBusDto(bus) {
	if (!bus) return null;
	return {
		busId: bus.bus_id,
		plateNumber: bus.plate_number,
		model: bus.model || null,
		status: bus.status,
		capacity: typeof bus.capacity === 'number' ? bus.capacity : (bus.capacity ? Number(bus.capacity) : 0),
	};
}

module.exports = { toBusDto };
