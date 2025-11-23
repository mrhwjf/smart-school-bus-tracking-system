const { sequelize, DataTypes } = require('../config/dbConfig');

const db = {};

db.sequelize = sequelize;
db.DataTypes = DataTypes;

// Models

db.Role = require('./Role')(sequelize, DataTypes);
db.User = require('./User')(sequelize, DataTypes);
db.Parent = require('./Parent')(sequelize, DataTypes);
db.Driver = require('./Driver')(sequelize, DataTypes);
db.Student = require('./Student')(sequelize, DataTypes);
db.Class = require('./Class')(sequelize, DataTypes);
db.Bus = require('./Bus')(sequelize, DataTypes);
db.Route = require('./Route')(sequelize, DataTypes);
db.Stop = require('./Stop')(sequelize, DataTypes);
db.Trip = require('./Trip')(sequelize, DataTypes);
db.RoutePassenger = require('./RoutePassenger')(sequelize, DataTypes);
db.PickupRecord = require('./PickupRecord')(sequelize, DataTypes);
db.Message = require('./Message')(sequelize, DataTypes);
db.Notification = require('./Notification')(sequelize, DataTypes);
db.UserNotification = require('./UserNotification')(sequelize, DataTypes);
db.Schedule = require('./Schedule')(sequelize, DataTypes);
db.ScheduleDay = require('./ScheduleDay')(sequelize, DataTypes);
db.RouteStop = require('./RouteStop')(sequelize, DataTypes);

// Associations
// Role -> User
db.Role.hasMany(db.User, { foreignKey: 'role_id', sourceKey: 'role_id', onDelete: 'RESTRICT' });
db.User.belongsTo(db.Role, { foreignKey: 'role_id', targetKey: 'role_id', onDelete: 'RESTRICT' });

// User subtypes (1:1)
db.User.hasOne(db.Parent, { foreignKey: 'parent_id', sourceKey: 'user_id', onDelete: 'CASCADE' });
db.Parent.belongsTo(db.User, { foreignKey: 'parent_id', targetKey: 'user_id', onDelete: 'CASCADE' });

db.User.hasOne(db.Driver, { foreignKey: 'driver_id', sourceKey: 'user_id', onDelete: 'CASCADE' });
db.Driver.belongsTo(db.User, { foreignKey: 'driver_id', targetKey: 'user_id', onDelete: 'CASCADE' });

// Parent -> Student
db.Parent.hasMany(db.Student, { foreignKey: 'parent_id', sourceKey: 'parent_id', onDelete: 'CASCADE' });
db.Student.belongsTo(db.Parent, { foreignKey: 'parent_id', targetKey: 'parent_id', onDelete: 'CASCADE' });

// Class -> Student
db.Class.hasMany(db.Student, { foreignKey: 'class_id', sourceKey: 'class_id', onDelete: 'RESTRICT' });
db.Student.belongsTo(db.Class, { foreignKey: 'class_id', targetKey: 'class_id', onDelete: 'RESTRICT' });

// Bus schedules: assign buses and drivers to routes with shift times
db.Route.hasMany(db.Schedule, { foreignKey: 'route_id', sourceKey: 'route_id', onDelete: 'RESTRICT' });
db.Schedule.belongsTo(db.Route, { foreignKey: 'route_id', targetKey: 'route_id', onDelete: 'RESTRICT' });

db.Bus.hasMany(db.Schedule, { foreignKey: 'bus_id', sourceKey: 'bus_id', onDelete: 'RESTRICT' });
db.Schedule.belongsTo(db.Bus, { foreignKey: 'bus_id', targetKey: 'bus_id', onDelete: 'RESTRICT' });

db.Driver.hasMany(db.Schedule, { foreignKey: 'driver_id', sourceKey: 'driver_id', onDelete: 'RESTRICT' });
db.Schedule.belongsTo(db.Driver, { foreignKey: 'driver_id', targetKey: 'driver_id', onDelete: 'RESTRICT' });

// Schedule days
db.Schedule.hasMany(db.ScheduleDay, { foreignKey: 'schedule_id', sourceKey: 'schedule_id', onDelete: 'CASCADE' });
db.ScheduleDay.belongsTo(db.Schedule, { foreignKey: 'schedule_id', targetKey: 'schedule_id', onDelete: 'CASCADE' });

// Route <-> Stop through RouteStop with order
db.Route.belongsToMany(db.Stop, { through: db.RouteStop, foreignKey: 'route_id', otherKey: 'stop_id' });
db.Stop.belongsToMany(db.Route, { through: db.RouteStop, foreignKey: 'stop_id', otherKey: 'route_id' });

// RoutePassenger → Student
db.RoutePassenger.belongsTo(db.Student, { foreignKey: 'student_id' });
db.Student.hasMany(db.RoutePassenger, { foreignKey: 'student_id' });

// RoutePassenger → Stop
db.RoutePassenger.belongsTo(db.Stop, { foreignKey: 'stop_id' });
db.Stop.hasMany(db.RoutePassenger, { foreignKey: 'stop_id' });

// RoutePassenger → Route (optional)
db.RoutePassenger.belongsTo(db.Route, { foreignKey: 'route_id' });
db.Route.hasMany(db.RoutePassenger, { foreignKey: 'route_id' });


// Schedule -> Trip
db.Schedule.hasMany(db.Trip, { foreignKey: 'schedule_id', sourceKey: 'schedule_id', onDelete: 'RESTRICT' });
db.Trip.belongsTo(db.Schedule, { foreignKey: 'schedule_id', targetKey: 'schedule_id', onDelete: 'RESTRICT' });

// Optional driver override on Trip
db.Driver.hasMany(db.Trip, { foreignKey: 'driver_id', sourceKey: 'driver_id', onDelete: 'SET NULL' });
db.Trip.belongsTo(db.Driver, { foreignKey: { name: 'driver_id', allowNull: true }, targetKey: 'driver_id', onDelete: 'SET NULL' });

// RouteStop already defines Route <-> Stop; Trips do not directly map to stops in schema

// Route <-> Student through RoutePassenger
db.Route.belongsToMany(db.Student, { through: db.RoutePassenger, foreignKey: 'route_id', otherKey: 'student_id' });
db.Student.belongsToMany(db.Route, { through: db.RoutePassenger, foreignKey: 'student_id', otherKey: 'route_id' });

// Route <-> Stop through 

// PickupRecord -> Student, Stop, Trip
db.Student.hasMany(db.PickupRecord, { foreignKey: 'student_id', sourceKey: 'student_id' });
db.PickupRecord.belongsTo(db.Student, { foreignKey: 'student_id', targetKey: 'student_id' });

db.Stop.hasMany(db.PickupRecord, { foreignKey: 'stop_id', sourceKey: 'stop_id' });
db.PickupRecord.belongsTo(db.Stop, { foreignKey: 'stop_id', targetKey: 'stop_id' });

db.Trip.hasMany(db.PickupRecord, { foreignKey: 'trip_id', sourceKey: 'trip_id', onDelete: 'CASCADE' });
db.PickupRecord.belongsTo(db.Trip, { foreignKey: 'trip_id', targetKey: 'trip_id', onDelete: 'CASCADE' });

// Message -> Notification
db.Message.hasMany(db.Notification, { foreignKey: 'message_id', sourceKey: 'message_id', onDelete: 'CASCADE' });
db.Notification.belongsTo(db.Message, { foreignKey: 'message_id', targetKey: 'message_id', onDelete: 'CASCADE' });

// Message -> User (sender) (FK: messages.sender_id, ON DELETE SET NULL)
db.User.hasMany(db.Message, { foreignKey: { name: 'sender_id', allowNull: true }, sourceKey: 'user_id', onDelete: 'SET NULL' });
db.Message.belongsTo(db.User, { foreignKey: { name: 'sender_id', allowNull: true }, targetKey: 'user_id', onDelete: 'SET NULL' });

// Notification -> UserNotification -> User
db.Notification.hasMany(db.UserNotification, { foreignKey: 'notification_id', sourceKey: 'notification_id', onDelete: 'CASCADE' });
db.UserNotification.belongsTo(db.Notification, { foreignKey: 'notification_id', targetKey: 'notification_id', onDelete: 'CASCADE' });

db.User.hasMany(db.UserNotification, { foreignKey: 'recipient_id', sourceKey: 'user_id', onDelete: 'CASCADE' });
db.UserNotification.belongsTo(db.User, { foreignKey: 'recipient_id', targetKey: 'user_id', onDelete: 'CASCADE' });

// Extra scopes (includes) after associations
db.User.addScope('withRole', { include: [{ model: db.Role }] });
db.User.addScope('withParent', { include: [{ model: db.Parent }] });
db.User.addScope('withDriver', { include: [{ model: db.Driver }] });
db.User.addScope('withFullDetails', {
	include: [
		{ model: db.Role },
		{ model: db.Parent },
		{ model: db.Driver }
	]
});

// --- Scopes for Student Model ---
db.Student.addScope('withParent', {
	// Fetches the Parent who owns the student record.
	include: [{ model: db.Parent, include: [{ model: db.User }] }]
});

db.Student.addScope('withClass', {
	// Fetches the Class the student belongs to.
	include: [{ model: db.Class }]
});

db.Student.addScope('withAssignedRoutes', {
	// Fetches the Routes this student is assigned to (via route_passengers).
	include: [{ model: db.Route, through: db.RoutePassenger }]
});

db.Student.addScope('withLatestRecords', {
	// Fetches the student's recent pickup/drop-off history.
	include: [{
		model: db.PickupRecord,
		limit: 5,
		order: [['recorded_at', 'DESC']]
	}]
});

// --- Scopes for Route Model ---
db.Route.addScope('withOrderedStopsAndStudents', {
	include: [
		{
			model: db.Stop,
			through: { attributes: ['stop_order'] },           // stop_order from RouteStop
			include: [
				{
					model: db.RoutePassenger,
					include: [
						{
							model: db.Student.scope('withClass', 'withParent')
						}
					]
				}
			],
		}
	],
	order: [[db.Stop, db.RouteStop, 'stop_order', 'ASC']] // stops ordered by stop_order
});

// --- Scopes for RoutePassenger Model ---
db.RoutePassenger.addScope('withStudentAndStop', {
	include: [
		{ model: db.Student.scope('withClass', 'withParent') },
		{ model: db.Stop }
	]
});

// --- Scopes for Schedule Model ---
db.Schedule.addScope('withFullDetails', {
	include: [
		{ model: db.Route.scope('withOrderedStopsAndStudents') },
		{ model: db.Bus },
		{ model: db.Driver },
		{ model: db.ScheduleDay }
	]
});

// --- Scopes for Trip Model ---
db.Trip.addScope('withFullDetails', {
	// Fetches the schedule, driver, and bus information related to the trip.
	include: [
		{
			model: db.Schedule,
			include: [
				{ model: db.Route },
				{ model: db.Bus }
			]
		},
		{ model: db.Driver, as: 'OverrideDriver' } // Assuming 'Driver' is associated twice: main and optional override
	]
});

db.Trip.addScope('withAllPickupRecords', {
	// Fetches all pickup/drop-off records for a specific trip, including stop and student details.
	include: [{
		model: db.PickupRecord,
		include: [db.Student, db.Stop]
	}]
});

// --- Scopes for Notification/Message Model ---
db.Notification.addScope('withMessage', {
	// Fetches the message content associated with the notification.
	include: [{ model: db.Message, include: [{ model: db.User, as: 'Sender' }] }]
});

db.User.addScope('withPendingNotifications', {
	// Fetches unread notifications for a specific user (recipient).
	include: [{
		model: db.Notification,
		through: { where: { read_status: false } }
	}]
});

module.exports = db;
