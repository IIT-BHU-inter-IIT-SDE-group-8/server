const express = require("express");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();
const initializePassport = require('./src/middleware/configPassport')
const bodyParser = require('body-parser');
const path = require('path');
const {errorMiddleware} = require('./middleware/error');
// const flash = require("express-flash");

const userRouter = require('./src/routes/auth_routes');

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
passport.serializeUser(function (user, done) {
    done(null, user)
})

passport.deserializeUser(function (user, done) {
    done(null, user);
})

// Parses details from a form
app.use(express.urlencoded({ extended: false }));
// app.set("view engine", "ejs");

//Router
app.use("/users", userRouter);


// Funtion inside passport which initializes passport
app.use(passport.initialize());
// Store our variables to be persisted across the whole session. Works with app.use(Session) above
app.use(passport.session());


// Testing server
app.get("/", (req, res) => {
    const options = {
        root: path.join(__dirname)
    };
    res.sendFile("api/output.html", options);
})

app.use(errorMiddleware);

module.exports = app;
