const { Router } = require('express');
const router = Router();
const { handleValidation } = require('../middlewares/handleValidation');

const { busController } = require('../controllers');
const { createBusRequest, updateBusRequest, listBusesQuery } = require('../middlewares/validation');


router.get('/buses', listBusesQuery, handleValidation, busController.listBuses);
router.get('/buses/:busId', busController.getBus);
router.post('/buses', createBusRequest, handleValidation, busController.createBus);
router.put('/buses/:busId', updateBusRequest, handleValidation, busController.updateBus);
router.delete('/buses/:busId', busController.deleteBus);

module.exports = router;
