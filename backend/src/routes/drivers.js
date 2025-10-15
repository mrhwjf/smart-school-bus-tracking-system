const express = require('express');
const ctrl = require('../controllers/driversController');

const router = express.Router();

router.get('/', ctrl.list);       // GET /api/v1/drivers
router.get('/:id', ctrl.get);     // GET /api/v1/drivers/:id
router.post('/', ctrl.create);    // POST /api/v1/drivers
router.put('/:id', ctrl.update);  // PUT /api/v1/drivers/:id
router.delete('/:id', ctrl.remove); // DELETE /api/v1/drivers/:id

module.exports = router;
