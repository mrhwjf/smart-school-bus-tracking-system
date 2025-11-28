const { Router } = require('express');
const router = Router();
const { handleValidation } = require('../middlewares/handleValidation');

const { userController } = require('../controllers');
const {
	listUsersQuery, createUserRequest, updateUserRequest,
} = require('../middlewares/validation');


// Roles
router.get('/roles', userController.listRoles);
router.get('/roles/:roleId', userController.getRole);
router.post('/roles', userController.createRole);
router.put('/roles/:roleId', userController.updateRole);
router.delete('/roles/:roleId', userController.deleteRole);

// Users
router.get('/users', listUsersQuery, handleValidation, userController.listUsers);
router.get('/users/:userId', userController.getUser);
router.post('/users', createUserRequest, handleValidation, userController.createUser);
router.put('/users/:userId', updateUserRequest, handleValidation, userController.updateUser);
router.delete('/users/:userId', userController.deleteUser);

// Drivers
router.get('/drivers', userController.listDrivers);

// Parents
router.get('/parents', userController.listParents);

module.exports = router;
