const { Router } = require('express');
const router = Router();

const { scheduleController } = require('../controllers');
const { handleValidation } = require('../middlewares/handleValidation');
const { listSchedulesQuery, createScheduleRequest, updateScheduleRequest, replaceScheduleDaysRequest } = require('../middlewares/validation');

// Schedules
router.get('/schedules', listSchedulesQuery, handleValidation, scheduleController.listSchedules);
router.get('/schedules/:scheduleId', scheduleController.getSchedule);
router.post('/schedules', createScheduleRequest, handleValidation, scheduleController.createSchedule);
router.put('/schedules/:scheduleId', updateScheduleRequest, handleValidation, scheduleController.updateSchedule);
router.delete('/schedules/:scheduleId', scheduleController.deleteSchedule);

// Schedule days endpoints
router.get('/schedules/:scheduleId/days', scheduleController.getScheduleDays);
router.put('/schedules/:scheduleId/days', replaceScheduleDaysRequest, handleValidation, scheduleController.replaceScheduleDays);

module.exports = router;
