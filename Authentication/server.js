const express = require("express");
const {LandingPage, viewSignUp, viewLogin, AfterLogin} = require('./controllers/displayPages')
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const {checkAuthenticated, checkNotAuthenticated} = require('./controllers/checkAuth')
const { auth, callback } = require('./controllers/googleAuth')
const cookieParser = require("cookie-parser");
const {login, fetchuser, getUser, register, logout} = require('./controllers/auth')
require("dotenv").config();
const app = express();
const initializePassport = require("./passportConfig");
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3000;
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

app.get("/", LandingPage);
app.get("/users/register", checkAuthenticated, viewSignUp)
app.get("/users/login", checkAuthenticated, viewLogin)
app.get("/users/dashboard", checkNotAuthenticated, AfterLogin)

app.get("/users/logout",logout)
app.post("/users/register",register)
app.post("/users/login",login)
app.post('/users/getuser', fetchuser, getUser)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


