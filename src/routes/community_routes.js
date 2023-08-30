const express = require('express');
const router = express.Router();
const cors = require('cors');
const { checkAuthenticated } = require('../middleware/checkAuthentication');
const { queryTripsByCommunityId, UpdateTrip, deleteTrip } = require('../controllers/tripController')

router.use(cors());

router.get('/:community_id/trips', checkAuthenticated, queryTripsByCommunityId)
router.put(':/community_id/trips/:trip_id', checkAuthenticated, UpdateTrip)
router.delete(':/community_id/trips/:trip_id', checkAuthenticated, deleteTrip)

module.exports = router