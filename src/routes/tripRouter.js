const express = require('express');
const router = express.Router();
const cors = require('cors');
const { checkAuthenticated } = require('../middleware/checkAuthentication');
const { getAllTrips, createTrip, getTripById, UpdateTrip, deleteTrip } = require('../controllers/tripController')

router.use(cors());

router.route("/").get(checkAuthenticated,getAllTrips).post(checkAuthenticated,createTrip);
router.route("/:trip_id").get(getTripById).put(checkAuthenticated,UpdateTrip).delete(checkAuthenticated,deleteTrip);
router.route("/:trip_id/join_requests").get(checkAuthenticated,getAllTripJoinRequests).post(checkAuthenticated,AllowOrDenyTripJoinRequest);

//TODO: Add middlware later

module.exports = router
