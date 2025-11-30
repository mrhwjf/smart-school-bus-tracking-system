function toNumber(val) { return (val === null || val === undefined) ? null : Number(val); }

function toStopDto(stop) {
	if (!stop) return null;
	return {
		stopId: stop.stop_id,
		name: stop.name,
		latitude: toNumber(stop.latitude),
		longitude: toNumber(stop.longitude),
		address: stop.address || null,
		active: typeof stop.active === 'boolean' ? stop.active : !!stop.active,
	};
}

module.exports = { toStopDto };
