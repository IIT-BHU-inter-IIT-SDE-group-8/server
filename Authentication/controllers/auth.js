const { pool } = require('../dbConfig')
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'AdityaIsagoodb$oy'

const login = async (req, res) => {
    let success = false;

    const { email, password } = req.body;
    console.log({ password, email })
    pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [email],
        (err, results) => {
            if (err) {
                throw err;
            }
            console.log("credentials are:", results.rows);

            if (results.rows.length > 0) {

                const user = results.rows[0];
                console.log("user_password:", user.user_password);
                console.log("password:", password);
                bcrypt.compare(password, user.user_password, (err, isMatch) => {
                    console.log("1")
                    if (err) {
                        console.log("error:", err);
                    }
                    if (isMatch) {
                        console.log("2");
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
                        console.log("3");
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

const fetchuser = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ error: "Please authenticate  using a valid token" })
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        console.log("data:", data);
        req.user = data.user;
        console.log("reqested user:", req.user)
        next();
    } catch (error) {
        res.status(401).send({ error: "Please authenticate  using a valid token" })
    }
}

const getUser = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming user_id is the correct column name

        // Query the PostgreSQL database to retrieve the user
        const query = 'SELECT user_id, username, email, user_bio FROM users WHERE user_id = $1';
        const { rows } = await pool.query(query, [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = rows[0];
        delete user.user_password; // Assuming you don't want to send the password back

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server error' });
    }
}

const register = async (req, res) => {


    const { name, email, password, bio } = req.body;
    console.log({ name, email, password, bio });

    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(password, salt)


    const data = {
        user: {
            email: email
        }
    }

    pool.query(
        `SELECT * FROM users
            WHERE email = $1`,
        [email],
        (err, results) => {
            if (err) {
                console.log("error in serer:", err);
            }
            console.log("results are", results.rows);

            if (results.rows.length > 0) {
                return res.render("register", {
                    message: "Email already registered"
                });
            } else {
                pool.query(
                    `INSERT INTO users (username, email, user_password, user_bio)
                    VALUES ($1, $2, $3, $4)
                    RETURNING user_id, user_password`,
                    [name, email, secPass, bio],
                    (err, results) => {
                        if (err) {
                            throw err;
                        }
                        console.log("rows of results are:", results.rows);
                        req.flash("success_msg", "You are now registered. Please log in");
                        // res.redirect("/users/login");
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

module.exports = { login, fetchuser, getUser, register, logout }