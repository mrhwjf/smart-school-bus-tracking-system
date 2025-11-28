function toScheduleDayDto(d) {
	if (!d) return null;
	return {
		scheduleId: d.schedule_id,
		dayOfWeek: d.day_of_week,
	};
}

module.exports = { toScheduleDayDto };
