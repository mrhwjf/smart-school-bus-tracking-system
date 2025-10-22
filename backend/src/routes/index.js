const express = require('express');
const router = express.Router();

// Mount student routes
const studentsRouter = require('./students');
router.use('/students', studentsRouter);

// Additional entity routes
const parentsRouter = require('./parents');
router.use('/parents', parentsRouter);

const pickupRecordsRouter = require('./pickupRecords');
router.use('/pickup-records', pickupRecordsRouter);

const usersRouter = require('./users');
router.use('/users', usersRouter);

const rolesRouter = require('./roles');
router.use('/roles', rolesRouter);

module.exports = router;
