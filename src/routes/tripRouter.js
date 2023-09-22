const express = require('express');
const router = express.Router();
const cors = require('cors');
const { checkAuthenticated } = require('../middleware/checkAuthentication');
const { getAllTrips, createTrip, getTripById, updateTrip, deleteTrip } = require('../controllers/tripController')

router.use(cors());

router.route("/").get(getAllTrips).post(createTrip);
router.route("/:trip_id").get(getTripById).put(updateTrip).delete(deleteTrip);

//TODO: Add middlware later

module.exports = router
