const LandingPage = (req, res) => {
    res.redirect("/");
};

const viewSignUp =  (req, res) => {
    res.redirect("/users/register");
};

const viewLogin = (req, res) => {
    // flash sets a messages variable. passport sets the error message
    // console.log("flash error:",req.session.flash.error);
    res.redirect("/users/login");
};

const AfterLogin = (req, res) => {
    console.log(req.isAuthenticated());
    res.redirect("/users/dashboard");
};

module.exports = {LandingPage, viewSignUp, viewLogin, AfterLogin}