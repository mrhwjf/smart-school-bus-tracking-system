const express = require('express');
const ctrl = require('../controllers/userNotificationsController');
const router = express.Router();

router.get('/', ctrl.list);
router.get('/:notification_id/:recipient_id', ctrl.get);
router.post('/', ctrl.create);
router.put('/:notification_id/:recipient_id', ctrl.update);
router.delete('/:notification_id/:recipient_id', ctrl.remove);

module.exports = router;
