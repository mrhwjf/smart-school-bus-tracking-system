const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
	process.env.DB_NAME || 'bus_tracking',
	process.env.DB_USER || 'root',
	process.env.DB_PASSWORD || '',
	{
		host: process.env.DB_HOST || '127.0.0.1',
		dialect: process.env.DB_DIALECT || 'mysql',
		logging: false,
	}
);

// Optional: debug
async function testConnection() {
	try {
		await sequelize.authenticate();
		console.log('Database connection established successfully.');
	} catch (error) {
		console.error('Unable to connect to the database:', error.message);
	}
}
// testConnection(); // uncomment to check on startup

module.exports = { sequelize, DataTypes };



