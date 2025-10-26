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
db.Bus = require('./Bus')(sequelize, DataTypes);
db.Route = require('./Route')(sequelize, DataTypes);
db.Stop = require('./Stop')(sequelize, DataTypes);
db.Trip = require('./Trip')(sequelize, DataTypes);
db.TripStop = require('./TripStop')(sequelize, DataTypes);
db.TripPassenger = require('./TripPassenger')(sequelize, DataTypes);
db.PickupRecord = require('./PickupRecord')(sequelize, DataTypes);
db.NavigationLog = require('./NavigationLog')(sequelize, DataTypes);
db.Message = require('./Message')(sequelize, DataTypes);
db.Notification = require('./Notification')(sequelize, DataTypes);
db.UserNotification = require('./UserNotification')(sequelize, DataTypes);

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

// Trip -> NavigationLog (FK: navigation_logs.trip_id, ON DELETE CASCADE)
db.Trip.hasMany(db.NavigationLog, { foreignKey: 'trip_id', sourceKey: 'trip_id', onDelete: 'CASCADE' });
db.NavigationLog.belongsTo(db.Trip, { foreignKey: 'trip_id', targetKey: 'trip_id', onDelete: 'CASCADE' });

// Message -> Notification
db.Message.hasMany(db.Notification, { foreignKey: 'message_id', sourceKey: 'message_id' });
db.Notification.belongsTo(db.Message, { foreignKey: 'message_id', targetKey: 'message_id' });

// Message -> User (sender) (FK: messages.sender_id, ON DELETE SET NULL)
db.User.hasMany(db.Message, { foreignKey: { name: 'sender_id', allowNull: true }, sourceKey: 'user_id', onDelete: 'SET NULL' });
db.Message.belongsTo(db.User, { foreignKey: { name: 'sender_id', allowNull: true }, targetKey: 'user_id', onDelete: 'SET NULL' });

// Notification -> UserNotification -> User
db.Notification.hasMany(db.UserNotification, { foreignKey: 'notification_id', sourceKey: 'notification_id' });
db.UserNotification.belongsTo(db.Notification, { foreignKey: 'notification_id', targetKey: 'notification_id' });

db.User.hasMany(db.UserNotification, { foreignKey: 'recipient_id', sourceKey: 'user_id' });
db.UserNotification.belongsTo(db.User, { foreignKey: 'recipient_id', targetKey: 'user_id' });

module.exports = db;
