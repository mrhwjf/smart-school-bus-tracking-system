const express = require('express');
const cors = require('cors');
require('dotenv').config();

const routes = require('./src/routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/v1', routes);

// thêm: in thông tin models/associations để kiểm tra tại runtime
const db = require('./src/models');
/* eslint-disable no-console */
console.log('Models loaded:', Object.keys(db).filter(k => typeof db[k] === 'function' || typeof db[k] === 'object'));
console.log('Trip associations:', Object.keys(db.Trip?.associations || {}));
console.log('Stop associations:', Object.keys(db.Stop?.associations || {}));
console.log('TripStop model present:', !!db.TripStop);
/* eslint-enable no-console */

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
	console.error(err);
	let status = err.status || 500;
	let message = err.message || 'Internal Server Error';

	// Map common Sequelize errors
	if (err.name === 'SequelizeUniqueConstraintError') {
		status = 409;
		message = 'Duplicate value violates unique constraint';
	} else if (err.name === 'SequelizeValidationError') {
		status = 400;
		message = err.errors?.map(e => e.message).join(', ') || 'Validation error';
	} else if (err.name === 'SequelizeForeignKeyConstraintError') {
		status = 400;
		message = 'Invalid reference to related entity';
	}

	res.status(status).json({ message });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	// eslint-disable-next-line no-console
	console.log(`Backend server listening on port ${PORT}`);
});

module.exports = app;
