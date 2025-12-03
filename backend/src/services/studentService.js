const apiResponse = require('../utils/apiResponse');
const createPagination = require('../utils/pagination');
const { toStudentDto, toClassDto } = require('../dtos');
const { StudentRepository, ClassRepository, UserRepository } = require('../repositories');
const { 
	Student, 
	RoutePassenger, 
	Route, 
	Schedule, 
	Bus, 
	Driver,
	User,
	Stop,
	Trip
} = require('../models');

async function listStudents({ filter = {}, sort, page = 0, pageSize = 10 } = {}, options = {}) {
	const { rows, count, page: p, pageSize: s, totalPages } = await StudentRepository.list({ filter, sort, page, pageSize }, options);
	const items = (rows || []).map(toStudentDto);
	const data = createPagination({ items, page: p, size: s, totalElements: count, totalPages });
	return apiResponse.success('Students fetched successfully', data);
}

async function getStudentById(studentId, options = {}) {
	const student = await StudentRepository.findById(studentId, options);
	if (!student) return apiResponse.failure('Student not found');
	return apiResponse.success('Student fetched successfully', toStudentDto(student));
}

async function createStudent(data, options = {}) {
	const created = await StudentRepository.create({
		parent_id: data.parentId,
		name: data.name,
		class_id: data.classId,
		gender: data.gender,
		date_of_birth: data.dateOfBirth,
	}, options);
	return apiResponse.success('Student created successfully', toStudentDto(created));
}

async function updateStudent(studentId, changes, options = {}) {
	const updated = await StudentRepository.updateById(studentId, {
		parent_id: changes.parentId,
		name: changes.name,
		class_id: changes.classId,
		gender: changes.gender,
		date_of_birth: changes.dateOfBirth,
	}, options);
	if (!updated) return apiResponse.failure('Student not found');
	return apiResponse.success('Student updated successfully', toStudentDto(updated));
}

async function deleteStudent(studentId, options = {}) {
	const deleted = await StudentRepository.deleteById(studentId, options);
	return apiResponse.success('Student deleted successfully', { deleted });
}

async function bulkDeleteStudents(where = {}, options = {}) {
	const deletedCount = await StudentRepository.bulkDelete(where, options);
	return apiResponse.success('Students deleted successfully', { deletedCount });
}

async function listClassesForDropdown(options = {}) {
	const { rows } = await ClassRepository.list({}, options);
	const items = (rows || []).map(toClassDto);
	return apiResponse.success('Classes fetched successfully', items);
}

async function listParentsForDropdown(options = {}) {
	const { rows } = await UserRepository.listParentsForDropdown(options);
	const items = (rows || []).map(parent => {
		return {
			userId: parent.user_id,
			name: parent.name
		};
	});
	return apiResponse.success('Parents fetched successfully', items);
}

// Get student's bus information (route, bus, driver)
async function getStudentBusInfo(studentId) {
	try {
		// Find student's route passenger record
		const routePassenger = await RoutePassenger.findOne({
			where: { student_id: studentId },
			include: [
				{
					model: Student,
					attributes: ['student_id', 'name', 'class_id']
				},
				{
					model: Route,
					attributes: ['route_id', 'name', 'description'],
					include: [
						{
							model: Schedule,
							attributes: ['schedule_id', 'shift', 'start_time', 'end_time', 'bus_id', 'driver_id'],
							where: { active: true },
							required: false,
							include: [
								{
									model: Bus,
									attributes: ['bus_id', 'plate_number', 'model', 'status', 'capacity']
								},
								{
									model: Driver,
									attributes: ['driver_id', 'license_number'],
									include: [
										{
											model: User,
											attributes: ['name', 'phone_number']
										}
									]
								}
							]
						}
					]
				},
				{
					model: Stop,
					attributes: ['stop_id', 'name', 'latitude', 'longitude', 'address']
				}
			]
		});

		if (!routePassenger) {
			return apiResponse.failure('Student not assigned to any route');
		}

		// Get today's trip for this route
		const today = new Date().toISOString().split('T')[0];
		const schedule = routePassenger.Route?.Schedules?.[0];
		
		let trip = null;
		if (schedule) {
			trip = await Trip.findOne({
				where: {
					schedule_id: schedule.schedule_id,
					trip_date: today,
					status: ['SCHEDULED', 'IN_PROGRESS']
				},
				attributes: ['trip_id', 'status', 'actual_start_time', 'actual_end_time']
			});
		}

		// Format response
		const data = {
			student: {
				studentId: routePassenger.Student?.student_id,
				name: routePassenger.Student?.name,
				classId: routePassenger.Student?.class_id
			},
			route: {
				routeId: routePassenger.Route?.route_id,
				name: routePassenger.Route?.name,
				description: routePassenger.Route?.description
			},
			stop: {
				stopId: routePassenger.Stop?.stop_id,
				name: routePassenger.Stop?.name,
				latitude: routePassenger.Stop?.latitude,
				longitude: routePassenger.Stop?.longitude,
				address: routePassenger.Stop?.address
			},
			bus: schedule?.Bus ? {
				busId: schedule.Bus.bus_id,
				plateNumber: schedule.Bus.plate_number,
				model: schedule.Bus.model,
				status: schedule.Bus.status,
				capacity: schedule.Bus.capacity
			} : null,
			driver: schedule?.Driver ? {
				driverId: schedule.Driver.driver_id,
				name: schedule.Driver.User?.name,
				phoneNumber: schedule.Driver.User?.phone_number,
				licenseNumber: schedule.Driver.license_number
			} : null,
			schedule: schedule ? {
				scheduleId: schedule.schedule_id,
				shift: schedule.shift,
				startTime: schedule.start_time,
				endTime: schedule.end_time
			} : null,
			trip: trip ? {
				tripId: trip.trip_id,
				status: trip.status,
				actualStartTime: trip.actual_start_time,
				actualEndTime: trip.actual_end_time
			} : null
		};

		return apiResponse.success('Student bus information fetched successfully', data);
	} catch (error) {
		console.error('Error fetching student bus info:', error);
		return apiResponse.failure('Failed to fetch student bus information');
	}
}

module.exports = {
	listStudents,
	listClassesForDropdown,
	listParentsForDropdown,
	getStudentById,
	createStudent,
	updateStudent,
	deleteStudent,
	bulkDeleteStudents,
	getStudentBusInfo
};
