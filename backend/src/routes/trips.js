const { Router } = require('express');
const router = Router();

const { tripController } = require('../controllers');
const {
	listTripsQuery, createTripRequest, updateTripRequest,
	listPickupRecordsQuery, createPickupRecordRequest, updatePickupRecordRequest,
} = require('../middlewares/validation');
const { handleValidation } = require('../middlewares/handleValidation');

// Trips
router.get('/trips', listTripsQuery, handleValidation, tripController.listTrips);
router.get('/trips/:tripId', tripController.getTrip);
router.post('/trips', createTripRequest, handleValidation, tripController.createTrip);
router.put('/trips/:tripId', updateTripRequest, handleValidation, tripController.updateTrip);
router.delete('/trips/:tripId', tripController.deleteTrip);

// Pickup records
router.get('/pickup-records', listPickupRecordsQuery, handleValidation, tripController.listPickupRecords);
router.get('/pickup-records/:recordId', tripController.getPickupRecord);
router.post('/pickup-records', createPickupRecordRequest, handleValidation, tripController.createPickupRecord);
router.put('/pickup-records/:recordId', updatePickupRecordRequest, handleValidation, tripController.updatePickupRecord);
router.delete('/pickup-records/:recordId', tripController.deletePickupRecord);

module.exports = router;
