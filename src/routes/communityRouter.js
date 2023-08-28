import express from "express"
import { addTripToCommunity, createCommunity, deleteCommunity, getAllCommunities, getAllTripsOfCommunity, getCommunityById, removeTripFromCommunity, updateCommunity } from "../controllers/communityController";

const router = express.Router();


router.route("/").get(getAllCommunities).post(createCommunity)
router.route("/:community_id").get(getCommunityById).put(updateCommunity).delete(deleteCommunity)
router.route("/:community_id/trips").get(getAllTripsOfCommunity)
router.route("/:community_id/trips/:trip_id").get().post(addTripToCommunity).delete(removeTripFromCommunity)

// TODO: add the function that corresponds to getTripById here at the get endpoint of /:trip_id
export default router;
