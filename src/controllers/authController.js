const { pool } = require('../models/configDB')
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET

const login = async (req, res) => {
    let success = false;

    const { email, password } = req.body;
    pool.query(
        `SELECT * FROM users WHERE user_email = $1`,
        [email],
        (err, results) => {
            if (err) {
                throw err;
            }

            if (results.rows.length > 0) {

                const user = results.rows[0];
                bcrypt.compare(password, user.user_password, (err, isMatch) => {
                    if (err) {
                        console.log("error:", err);
                    }
                    if (isMatch) {
                        const data = {
                            user: {
                                id: user.user_id
                            }
                        }
                        const authToken = jwt.sign(data, JWT_SECRET);
                        success = true
                        res.json({ success, authToken })
                    } else {
                        //password is incorrect
                        success = false
                        return res.status(400).json({ success, error: "Please try to login with correct credentials" });
                    }
                });
            } else {
                // No user
                return done(null, false, {
                    message: "No user with that email address"
                });
            }
        }
    );
}

const register = async (req, res) => {


    const { name, email, password, bio, phone } = req.body;

    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(password, salt)


    const data = {
        user: {
            email: email
        }
    }

    pool.query(
        `SELECT * FROM users
            WHERE user_email = $1`,
        [email],
        (err, results) => {
            if (err) {
                console.log("error in serer:", err);
            }

            if (results.rows.length > 0) {
                return res.render("register", {
                    message: "Email already registered"
                });
            } else {
                pool.query(
                    `INSERT INTO users (user_name, user_email, user_password, user_bio, user_mobile)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING user_id, user_password`,
                    [name, email, secPass, bio, phone],
                    (err, results) => {
                        if (err) {
                            throw err;
                        }
                        req.flash("success_msg", "You are now registered. Please log in");
                    }
                );
            }
        }
    );

    const authToken = jwt.sign(data, JWT_SECRET);
    res.json({ authToken })
}

const logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            // Handle any error that might occur during logout
            console.error(err);
        }
        // Redirect or respond as needed
        res.render("index", { message: "You have logged out successfully" });
    });
};

module.exports = { login, register, logout }