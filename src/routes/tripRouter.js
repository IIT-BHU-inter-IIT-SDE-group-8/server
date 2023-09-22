const express = require('express');
const router = express.Router();
const cors = require('cors');
const { checkAuthenticated } = require('../middleware/checkAuthentication');
const { createTrip, getTripById, updateTrip, deleteTrip, queryTrips, getAllTripJoinRequests  } = require('../controllers/tripController')

router.use(cors());

router.route("/").get(queryTrips).post(createTrip);
router.route("/:trip_id").get(getTripById).put(updateTrip).delete(deleteTrip);
router.route("/:trip_id/join_requests").get(getAllTripJoinRequests).post();

//TODO: Add middlware later

module.exports = router
