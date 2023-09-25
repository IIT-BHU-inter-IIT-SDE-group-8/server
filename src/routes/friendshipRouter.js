const express = require("express");
const router = express.Router();
const { checkAuthenticated } = require("../middleware/checkAuthentication.js")
const { deleteFriendship, getAllFriendsOfUser } = require("../controllers/friendController");

router.route("/").delete(checkAuthenticated,deleteFriendship)
router.route("/:user_id").get(getAllFriendsOfUser)

module.exports = router
