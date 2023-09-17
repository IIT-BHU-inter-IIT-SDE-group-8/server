const express = require("express")
const { addTripToCommunity, createCommunity, deleteCommunity, getAllCommunities, getAllTripsOfCommunity, getCommunityById, removeTripFromCommunity, updateCommunity } = require("../controllers/communityController");
const { getTripById, deleteTrip, UpdateTrip } = require("../controllers/tripController");

const router = express.Router();


router.route("/").get(getAllCommunities).post(createCommunity)
router.route("/:community_id").get(getCommunityById).put(updateCommunity).delete(deleteCommunity)
router.route("/:community_id/trips").get(getAllTripsOfCommunity)
router.route("/:community_id/trips/:trip_id").get(getTripById).post(addTripToCommunity).delete(removeTripFromCommunity).delete(deleteTrip).put(UpdateTrip);

// TODO: add the function that corresponds to getTripById here at the get endpoint of /:trip_id;
// TODO: add error handling for when user tries to update a community that does not exist

module.exports = router
