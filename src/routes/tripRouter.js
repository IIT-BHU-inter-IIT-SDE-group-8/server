const express = require('express');
const router = express.Router();
const cors = require('cors');
const { checkAuthenticated } = require('../middleware/checkAuthentication');
const { getAllTrips, getAllTripJoinRequests, AllowOrDenyTripJoinRequest, createTrip, getTripById, UpdateTrip, deleteTrip } = require('../controllers/tripController')

router.use(cors());

router.route("/").get(getAllTrips).post(createTrip);
router.route("/:trip_id").get(getTripById).put(UpdateTrip).delete(deleteTrip);
router.route("/:trip_id/join_requests").get(getAllTripJoinRequests).post(AllowOrDenyTripJoinRequest);

//TODO: Add middlware later

module.exports = router
