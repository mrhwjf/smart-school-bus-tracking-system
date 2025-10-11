const express = require('express');
const cors = require('cors');
require('dotenv').config();

const routes = require('./src/routes');
const { errorHandler } = require('./src/middlewares/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/v1', routes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	// eslint-disable-next-line no-console
	console.log(`Backend server listening on port ${PORT}`);
});

module.exports = app;
