const express = require("express");
const passport = require("passport");
const flash = require("express-flash");
const cors = require('cors')
const session = require("express-session");
const { auth, callback } = require('./src/controllers/googleAuth')
const cookieParser = require("cookie-parser");
const {createTrip, queryTrips} = require('./src/controllers/tripControllers')
const {login, register, logout} = require('./src/controllers/authControllers')
require("dotenv").config();
const app = express();
const initializePassport = require('./src/middleware/configPassport')
const bodyParser = require('body-parser');

const PORT = process.env.PORT;
app.use(cors());
app.use(express.json())
app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
initializePassport(passport); 

app.get('/auth/google', auth)
app.get('/auth/google/callback', callback)

passport.serializeUser(function(user, done){
  done(null, user)
})

passport.deserializeUser(function(user, done){
  done(null, user);
})

// Parses details from a form
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

app.use(
  session({

    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false

  })
);
// Funtion inside passport which initializes passport
app.use(passport.initialize());
// Store our variables to be persisted across the whole session. Works with app.use(Session) above
app.use(passport.session());
app.use(flash());

let date = '2023-08-28'

app.get("/users/logout",logout)
app.post("/users/register",register)
app.post("/users/login",login)
app.post("/users/createtrip",createTrip)
app.post("/community/:community_id/trips",createTrip)
app.get(`/community/:community_id/trips`,queryTrips)

// /users/gettripsbyupdate

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


