const { Router } = require('express');
const router = Router();

const { handleValidation } = require('../middlewares/handleValidation');

const { studentController } = require('../controllers');
const { createStudentRequest, updateStudentRequest, listStudentsQuery } = require('../middlewares/validation');

router.get('/students', listStudentsQuery, handleValidation, studentController.listStudents);
router.get('/students/:studentId', studentController.getStudent);
router.get('/students/:studentId/bus-info', studentController.getStudentBusInfo);
router.post('/students', createStudentRequest, handleValidation, studentController.createStudent);
router.put('/students/:studentId', updateStudentRequest, handleValidation, studentController.updateStudent);
router.delete('/students/:studentId', studentController.deleteStudent);

module.exports = router;
