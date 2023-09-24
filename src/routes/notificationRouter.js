const express = require("express")
const { checkAuthenticated } = require("../middleware/checkAuthentication.js");
const { getAllNotifs, getNotifById, updateNotif, deleteNotif, saveNotifObject } = require("../controllers/notificationsController.js");
const router = express.Router();


router.route("/").get(getAllNotifs).post(checkAuthenticated, saveNotifObject)
router.route("/:notif_id").get(getNotifById).put(updateNotif).delete(deleteNotif)


// TODO: add the function that corresponds to getTripById here at the get endpoint of /:trip_id;
// TODO: add error handling for when user tries to update a community that does not exist

module.exports = router

