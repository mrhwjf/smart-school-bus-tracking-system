const { sequelize, DataTypes } = require('../config/database');

const db = {};

db.sequelize = sequelize;
db.DataTypes = DataTypes;

// Models

db.Role = require('./roles')(sequelize, DataTypes);
db.User = require('./users')(sequelize, DataTypes);
db.Parent = require('./parents')(sequelize, DataTypes);
db.Driver = require('./drivers')(sequelize, DataTypes);
db.Student = require('./students')(sequelize, DataTypes);
db.Bus = require('./buses')(sequelize, DataTypes);
db.Route = require('./routes')(sequelize, DataTypes);
db.Stop = require('./stops')(sequelize, DataTypes);
db.Trip = require('./trips')(sequelize, DataTypes);
db.TripStop = require('./tripStops')(sequelize, DataTypes);
db.TripPassenger = require('./tripPassengers')(sequelize, DataTypes);
db.PickupRecord = require('./pickupRecords')(sequelize, DataTypes);
db.NavigationLog = require('./navigationLogs')(sequelize, DataTypes);
db.Message = require('./messages')(sequelize, DataTypes);
db.Notification = require('./notifications')(sequelize, DataTypes);
db.UserNotification = require('./userNotifications')(sequelize, DataTypes);

// Associations
// Role -> User
db.Role.hasMany(db.User, { foreignKey: 'role_id', sourceKey: 'role_id' });
db.User.belongsTo(db.Role, { foreignKey: 'role_id', targetKey: 'role_id' });

// User subtypes (1:1)
db.User.hasOne(db.Parent, { foreignKey: 'parent_id', sourceKey: 'user_id' });
db.Parent.belongsTo(db.User, { foreignKey: 'parent_id', targetKey: 'user_id' });

db.User.hasOne(db.Driver, { foreignKey: 'driver_id', sourceKey: 'user_id' });
db.Driver.belongsTo(db.User, { foreignKey: 'driver_id', targetKey: 'user_id' });

// Parent -> Student
db.Parent.hasMany(db.Student, { foreignKey: 'parent_id', sourceKey: 'parent_id' });
db.Student.belongsTo(db.Parent, { foreignKey: 'parent_id', targetKey: 'parent_id' });

// Driver -> Bus (one-to-one via driver_id unique)
db.Driver.hasOne(db.Bus, { foreignKey: 'driver_id', sourceKey: 'driver_id' });
db.Bus.belongsTo(db.Driver, { foreignKey: 'driver_id', targetKey: 'driver_id' });

// Route -> Stop
db.Route.hasMany(db.Stop, { foreignKey: 'route_id', sourceKey: 'route_id' });
db.Stop.belongsTo(db.Route, { foreignKey: 'route_id', targetKey: 'route_id' });

// Route -> Trip
db.Route.hasMany(db.Trip, { foreignKey: 'route_id', sourceKey: 'route_id' });
db.Trip.belongsTo(db.Route, { foreignKey: 'route_id', targetKey: 'route_id' });

// Bus -> Trip
db.Bus.hasMany(db.Trip, { foreignKey: 'bus_id', sourceKey: 'bus_id' });
db.Trip.belongsTo(db.Bus, { foreignKey: 'bus_id', targetKey: 'bus_id' });

// Trip <-> Stop through TripStop
db.Trip.belongsToMany(db.Stop, { through: db.TripStop, foreignKey: 'trip_id', otherKey: 'stop_id' });
db.Stop.belongsToMany(db.Trip, { through: db.TripStop, foreignKey: 'stop_id', otherKey: 'trip_id' });

// Trip <-> Student through TripPassenger
db.Trip.belongsToMany(db.Student, { through: db.TripPassenger, foreignKey: 'trip_id', otherKey: 'student_id' });
db.Student.belongsToMany(db.Trip, { through: db.TripPassenger, foreignKey: 'student_id', otherKey: 'trip_id' });

// PickupRecord -> Student, Stop
db.Student.hasMany(db.PickupRecord, { foreignKey: 'student_id', sourceKey: 'student_id' });
db.PickupRecord.belongsTo(db.Student, { foreignKey: 'student_id', targetKey: 'student_id' });

db.Stop.hasMany(db.PickupRecord, { foreignKey: 'stop_id', sourceKey: 'stop_id' });
db.PickupRecord.belongsTo(db.Stop, { foreignKey: 'stop_id', targetKey: 'stop_id' });

// Bus -> NavigationLog
db.Bus.hasMany(db.NavigationLog, { foreignKey: 'bus_id', sourceKey: 'bus_id' });
db.NavigationLog.belongsTo(db.Bus, { foreignKey: 'bus_id', targetKey: 'bus_id' });

// Message -> Notification
db.Message.hasMany(db.Notification, { foreignKey: 'message_id', sourceKey: 'message_id' });
db.Notification.belongsTo(db.Message, { foreignKey: 'message_id', targetKey: 'message_id' });

// Notification -> UserNotification -> User
db.Notification.hasMany(db.UserNotification, { foreignKey: 'notification_id', sourceKey: 'notification_id' });
db.UserNotification.belongsTo(db.Notification, { foreignKey: 'notification_id', targetKey: 'notification_id' });

db.User.hasMany(db.UserNotification, { foreignKey: 'recipient_id', sourceKey: 'user_id' });
db.UserNotification.belongsTo(db.User, { foreignKey: 'recipient_id', targetKey: 'user_id' });

module.exports = db;
