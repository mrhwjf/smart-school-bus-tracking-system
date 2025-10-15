const express = require('express');
const router = express.Router();
const busesRouter = require('./buses');
const driversRouter = require('./drivers');
const usersRouter = require('./users');
const rolesRouter = require('./roles');
const messagesRouter = require('./messages');
const userNotificationsRouter = require('./userNotifications');

router.use('/buses', busesRouter);
router.use('/drivers', driversRouter);
router.use('/users', usersRouter);
router.use('/roles', rolesRouter);
router.use('/messages', messagesRouter);
router.use('/user-notifications', userNotificationsRouter);
module.exports = router;
