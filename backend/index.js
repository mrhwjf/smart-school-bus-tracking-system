const express = require('express');
const cors = require('cors');
require('dotenv').config();

const routes = require('./src/routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', routes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	// eslint-disable-next-line no-console
	console.log(`Backend server listening on port ${PORT}`);
});

module.exports = app;
