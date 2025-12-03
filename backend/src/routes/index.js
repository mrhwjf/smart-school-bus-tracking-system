const { Router } = require('express');
const router = Router();

// Grouped routers
router.use(require('./users'));
router.use(require('./buses'));
router.use(require('./routes'));
router.use(require('./stops'));
router.use(require('./students'));
router.use(require('./schedules'));
router.use(require('./trips'));
router.use(require('./notifications'));
router.use('/simulations', require('./simulations'));

module.exports = router;
