const app = require('./app.js');
const { createUsersTable, createUserBioTable } = require("./src/models/userModel");
const {
  createTrip, createCommunityTripTable, createUserTripTable, createTripJoinRequestTable
  // , createCommunityAdminTable
} = require('./src/models/tripModels');
const { createCommunityAdminTable, createUserCommunityTable } = require('./src/models/communityModel.js')
const { link_user_to_user, createFriendRequestTable } = require('./src/models/friendsModel.js');
const { createCommunityRequestTable, createCommunitiesTable } = require('./src/models/communityModel.js');
const PORT = process.env.PORT || 4000;

// Database Models
createUsersTable();
createUsersTable();
createTrip();
createCommunityRequestTable();
createCommunitiesTable()
createCommunityAdminTable();
createFriendRequestTable();
createUserBioTable();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
