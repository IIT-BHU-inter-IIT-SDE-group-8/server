const app = require('./app.js');
const { createUsersTable } = require("./src/models/userModel");
const {
    createTrip, trip_link_to_community, link_user_to_community, link_user_to_trip, join_request
} = require('./src/models/tripModels');
const { createFriendsTable, createFriendRequestsTable } = require('./src/models/friendsModel.js');
const { createCommunityRequestTable, createCommunitiesTable } = require('./src/models/communityModel.js');
const PORT = process.env.PORT || 4000;

// Database Models
createUsersTable();
createUsersTable();
createTrip();
createCommunityRequestTable();
createCommunitiesTable()
createFriendsTable();
createFriendRequestsTable();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
