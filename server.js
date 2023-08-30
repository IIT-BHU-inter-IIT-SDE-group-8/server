const express = require("express");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const {
  createTrip, trip_link_to_community, link_user_to_community, link_user_to_trip, link_user_to_user
} = require('./src/models/tripModels');
require("dotenv").config();
const app = express();
const initializePassport = require('./src/middleware/configPassport')
const bodyParser = require('body-parser');
// const flash = require("express-flash");
const communityRouter = require('./src/routes/community_routes');
const userRouter = require('./src/routes/auth_routes');
const tripRouter = require('./src/routes/trip_routes');
const { createUsersTable } = require("./src/models/userModel");
const PORT = process.env.PORT;

//---->Setting up middleware<----//

// Database Models
createUsersTable();
createTrip();
trip_link_to_community();
link_user_to_community();
link_user_to_trip();
link_user_to_user();

//Additional middlewares
app.use(express.json())
app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(flash());
app.use(
  session({

    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false

  })
);

// Passport
initializePassport(passport); 
passport.serializeUser(function(user, done){
  done(null, user)
})

passport.deserializeUser(function(user, done){
  done(null, user);
})

// Parses details from a form
app.use(express.urlencoded({ extended: false }));

//Router
app.use( "/", userRouter);
app.use('/trips',tripRouter);
app.use('/communities',communityRouter)

// Funtion inside passport which initializes passport
app.use(passport.initialize());
// Store our variables to be persisted across the whole session. Works with app.use(Session) above
app.use(passport.session());

// Testing server
app.get("/",(req,res)=>{
  res.send("Welcome to the Flight!")
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
