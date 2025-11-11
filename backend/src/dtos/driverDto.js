function toDriverDto(driver) {
	if (!driver) return null;
	return {
		driverId: driver.driver_id,
		licenseNumber: driver.license_number,
		vehiclePermit: driver.vehicle_permit || null,
	};
}

module.exports = { toDriverDto };
