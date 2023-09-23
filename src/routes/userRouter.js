const express = require('express');
const router = express.Router();
const { getAllUsers, updateUser, deleteUser, link_user_to_trip, getUserById, getAllTripsOfUser, unlinkTripAndUser } = require('../controllers/userControllers');
const { getAllTripJoinRequests, getTripById } = require('../controllers/tripController');
const { getAllInviteObjectsByUserId, getAllRequestObjectsByAdminId } = require('../controllers/communityRequestController');

router.get('/', getAllUsers);
router.route("/:user_id").get(getUserById).put(updateUser).delete(deleteUser);


router.route("/:user_id/trips").get(getAllTripsOfUser)
router.route('/:user_id/trips/:trip_id').get(getTripById).post(link_user_to_trip).delete(unlinkTripAndUser);
router.get('/:user_id/trips/:trip_id/join_requests', getAllTripJoinRequests)

router.route("/:user_id/community_requests").get((req, res) => {
    if (req.headers.request_type == "invite") {
        getAllInviteObjectsByUserId(req, res)
    }
    else if (req.headers.request_type == "request") {
        getAllRequestObjectsByAdminId(req, res)
    }
})

module.exports = router;
