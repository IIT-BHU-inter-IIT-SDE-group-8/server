const express = require('express');
const router = express.Router();
const cors = require('cors');
const { checkAuthenticated } = require('../middleware/checkAuthentication');
const { queryTripsByCommunityId, createTrip, UpdateTrip, deleteTrip } = require('../controllers/tripController')

router.use(cors());

router.get('/', checkAuthenticated, queryTripsByCommunityId)
router.post('/', checkAuthenticated, createTrip)
router.put('/:trip_id', checkAuthenticated, UpdateTrip);
router.delete('/:trip_id', checkAuthenticated, deleteTrip)

module.exports = router;