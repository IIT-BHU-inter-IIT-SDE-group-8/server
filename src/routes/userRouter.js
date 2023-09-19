const express = require('express');
const router = express.Router();
const { getAllUsers, updateUser, deleteUser, link_user_to_trip, getUserById, getAllTripsOfUser, unlinkTripAndUser } = require('../controllers/userControllers');
const { getAllTripJoinRequests, getTripById, getAllTripsOfUserFriendsAndCommunity } = require('../controllers/tripController');
const {checkAuthenticated} = require('../middleware/checkAuthentication')


router.get('/', getAllUsers);
router.route("/:user_id").get(checkAuthenticated,getUserById).put(checkAuthenticated,updateUser).delete(checkAuthenticated,deleteUser);
router.route("/:user_id/trips").get(checkAuthenticated,getAllTripsOfUserFriendsAndCommunity);
router.route("/:user_id/mytrips").get(checkAuthenticated, getAllTripsOfUser);
router.route('/:user_id/trips/:trip_id').get(checkAuthenticated,getTripById).post(checkAuthenticated,link_user_to_trip).delete(checkAuthenticated,unlinkTripAndUser);
router.get('/:user_id/trips/:trip_id/join_requests',checkAuthenticated, getAllTripJoinRequests)

module.exports = router;
