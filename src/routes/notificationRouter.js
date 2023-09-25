const express = require("express")
const { checkAuthenticated } = require("../middleware/checkAuthentication.js");
const { getAllNotifs, getNotifById, updateNotif, deleteNotif, saveNotifObject } = require("../controllers/notificationsController.js");
const { notifyFriends } = require("../services/pushNotifications.js");
const router = express.Router();


router.route("/").get(getAllNotifs).post(checkAuthenticated, checkAuthenticated, saveNotifObject)
router.route("/:notif_id").get(getNotifById).put(updateNotif).delete(deleteNotif)
router.route("/test").post((req, res) => {
  const { user_id, message } = req.body
notifyFriends(user_id, message)
res.send("success")
})




module.exports = router

