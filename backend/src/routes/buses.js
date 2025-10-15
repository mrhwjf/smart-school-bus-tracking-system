const express = require('express');
const ctrl = require('../controllers/busesController');

const router = express.Router();

router.get('/', ctrl.list);       // GET /api/v1/buses
router.get('/:id', ctrl.get);     // GET /api/v1/buses/:id
router.post('/', ctrl.create);    // POST /api/v1/buses
router.put('/:id', ctrl.update);  // PUT /api/v1/buses/:id
router.delete('/:id', ctrl.remove); // DELETE /api/v1/buses/:id

module.exports = router;
