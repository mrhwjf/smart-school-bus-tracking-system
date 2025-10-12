const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Set content type and charset for all responses
app.use((req, res, next) => {
  res.charset = 'utf-8';
  res.contentType('application/json; charset=utf-8');
  next();
});

// Mount routes
const studentsRouter = require('./routes/students');
app.use('/api/students', studentsRouter);

// Simple health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});

module.exports = app;
