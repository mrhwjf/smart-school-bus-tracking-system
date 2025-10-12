const express = require('express');
const router = express.Router();

// Mount student routes
const studentsRouter = require('./students');
router.use('/students', studentsRouter);

module.exports = router;
