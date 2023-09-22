const app = require('./app.js');
const { createUsersTable } = require("./src/models/userModel");
const {
    createTrip, createCommunityTripTable, createUserCommunityTable, createUserTripTable, createTripJoinRequestTable
} = require('./src/models/tripModels');
const { createFriendsTable } = require('./src/models/friendsModel.js');
const { createCommunityRequestsTable, createCommunitiesTable } = require("./src/models/communityModel.js")
const PORT = process.env.PORT || 4000;

// Database Models
createUsersTable();
createUsersTable();
createTrip();
createCommunitiesTable()
createCommunityRequestsTable()
createCommunityTripTable();
createUserCommunityTable();
createUserTripTable();
createFriendsTable();
createTripJoinRequestTable();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
