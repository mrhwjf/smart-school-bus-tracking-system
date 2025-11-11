const { Router } = require('express');
const router = Router();
const { handleValidation } = require('../middlewares/handleValidation');

const { stopController } = require('../controllers');
const { createStopRequest, updateStopRequest, listStopsQuery } = require('../middlewares/validation');

router.get('/stops', listStopsQuery, handleValidation, stopController.listStops);
router.get('/stops/:stopId', stopController.getStop);
router.post('/stops', createStopRequest, handleValidation, stopController.createStop);
router.put('/stops/:stopId', updateStopRequest, handleValidation, stopController.updateStop);
router.delete('/stops/:stopId', stopController.deleteStop);

module.exports = router;
