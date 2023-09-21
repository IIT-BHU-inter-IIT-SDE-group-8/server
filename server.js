const app = require('./app.js');
const { createUsersTable } = require("./src/models/userModel");
const {
  createTrip, createCommunityTripTable, createUserTripTable, createTripJoinRequestTable
  // , createCommunityAdminTable
} = require('./src/models/tripModels');
const { createCommunityAdminTable, createUserCommunityTable } = require('./src/models/communityModel.js')
const { createFriendsTable, createFriendRequestTable } = require('./src/models/friendsModel.js');
const PORT = process.env.PORT || 4000;

// Database Models
createUsersTable();
createUsersTable();
createTrip();
createCommunityTripTable();
createUserCommunityTable();
createUserTripTable();
createFriendsTable();
createTripJoinRequestTable();
createCommunityAdminTable();
createFriendRequestTable();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
