const express = require('express');
const router = express.Router();
const cors = require('cors');
const { checkAuthenticated } = require('../middleware/checkAuthentication');
const { getAllTrips, createTrip, getTripById, UpdateTrip, deleteTrip, getMyTrip, getTripMembers } = require
('../controllers/tripController')
const {getAllTripJoinRequests} = require('../utils/tripAdminLookup');
router.use(cors());

router.route("/").get(checkAuthenticated,getAllTrips).post(checkAuthenticated,createTrip);
router.get('/myTrips',checkAuthenticated, getMyTrip);
router.route("/:trip_id").get(checkAuthenticated,getTripById).put(checkAuthenticated,UpdateTrip).delete(checkAuthenticated,deleteTrip);
router.route('/:trip_id/participants').get(checkAuthenticated, getTripMembers)
router.route("/:trip_id/join_requests").get(checkAuthenticated,getAllTripJoinRequests);

module.exports = router
