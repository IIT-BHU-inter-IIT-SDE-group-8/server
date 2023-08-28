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

//---->Setting up middleware<----//


//Additional middlewares
app.use(express.json())
app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
initializePassport(passport);

// app.use(flash());
app.use(
  session({

    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false

  })
);

// Passport
passport.serializeUser(function(user, done) {
    done(null, user)
})

passport.deserializeUser(function(user, done) {
    done(null, user);
})

// Parses details from a form
app.use(express.urlencoded({ extended: false }));
// app.set("view engine", "ejs");

//Router
app.use( "/users", userRouter);



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

app.get("/users/logout", logout)
app.post("/users/register", register)
app.post("/users/login", login)

app.use("/communities", communityRouter);



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});




