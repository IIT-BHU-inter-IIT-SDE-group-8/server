
const express = require("express")
const router = express.Router();


router.route("/").get(getAllRequests).post(createRequest)
router.route("/:community_id").get(getCommunityById).put(updateCommunity).delete(deleteCommunity)
router.route("/:community_id/trips").get(getAllTripsOfCommunity)
router.route("/:community_id/trips/:trip_id").get(getTripById).post(addTripToCommunity).delete(removeTripFromCommunity)

// TODO: add the function that corresponds to getTripById here at the get endpoint of /:trip_id;
// TODO: add error handling for when user tries to update a community that does not exist

module.exports = router
