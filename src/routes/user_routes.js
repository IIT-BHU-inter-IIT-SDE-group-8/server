const express = require('express');
const router = express.Router();
const { getAllUsers, updateUser, deleteUser, link_user_to_trip } = require('../controllers/userControllers');
const { getAlltrips, getAllTripJoinRequests } = require('../controllers/tripController');

router.get('/', getAllUsers);
router.put('/:user_id', updateUser);
router.delete('/:user_id', deleteUser);
router.get('/:user_id/trips', getAlltrips)
router.post('/:user_id/trips/:trip_id', link_user_to_trip);
router.get('/:user_id/trips/:trip_id/join_requests', getAllTripJoinRequests)

module.exports = router;
