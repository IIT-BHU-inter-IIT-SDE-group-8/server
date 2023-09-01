const express = require("express");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const { login, register, logout } = require('./src/controllers/authControllers')
require("dotenv").config();
const app = express();
const initializePassport = require('./src/middleware/configPassport')
const bodyParser = require('body-parser');
// const flash = require("express-flash");

const userRouter = require('./src/routes/auth_routes');
const PORT = process.env.PORT || 3000;
const { createCommunitiesTable, createCommunitiesTripsTable } = require("./src/models/communityModel.js")
const {createTripsTable, createUserTripTable, createUserCommunityTable} = require("./src/models/tripModel.js")
// Database Models
createUsersTable();
createTripsTable();
createCommunitiesTable();
createUserTripTable()
createUserTripTable()
createCommunitiesTripsTable();
createUserCommunityTable()



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});




