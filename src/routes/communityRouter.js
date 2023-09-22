const express = require("express")
const { addTripToCommunity, createCommunity, deleteCommunity, getAllCommunities, getAllTripsOfCommunity, getCommunityById, removeTripFromCommunity, updateCommunity, getAllUsersOfCommunity, addUserToCommunity, removeUserFromCommunity } = require("../controllers/communityController");
const { getTripById } = require("../controllers/tripController");
const { getUserById } = require("../controllers/userControllers.js");
const { checkAuthenticated } = require("../middleware/checkAuthentication.js")

const router = express.Router();


router.route("/").get(getAllCommunities).post(checkAuthenticated, createCommunity)
router.route("/:community_id").get(getCommunityById).put(updateCommunity).delete(deleteCommunity)

router.route("/:community_id/trips").get(getAllTripsOfCommunity)
router.route("/:community_id/trips/:trip_id").get(getTripById).post(addTripToCommunity).delete(removeTripFromCommunity)

router.route("/:community_id/users").get(getAllUsersOfCommunity)
router.route("/:community_id/users/:user_id").get(getUserById).post(addUserToCommunity).delete(removeUserFromCommunity)

// TODO: add the function that corresponds to getTripById here at the get endpoint of /:trip_id;
// TODO: add error handling for when user tries to update a community that does not exist

module.exports = router
