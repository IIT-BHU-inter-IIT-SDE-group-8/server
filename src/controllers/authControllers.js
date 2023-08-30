const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const {client} = require('../config/configDB.js');
const JWT_SECRET = process.env.JWT_SECRET

const login = async (req, res) => {
    const { email, password } = req.body;

    client.query(
        `SELECT * FROM users WHERE user_email = $1`,
        [email],
        (err, results) => {
            if (err) {
                console.error("Error:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }

            if (results.rows.length > 0) {
                const user = results.rows[0];

                bcrypt.compare(password, user.user_password, (err, isMatch) => {
                    if (err) {
                        console.error("Error:", err);
                        return res.status(500).json({ error: "Internal Server Error" });
                    }

                    if (isMatch) {
                        const data = {
                            user: {
                                id: user.user_id
                            }
                        };
                        const authToken = jwt.sign(data, JWT_SECRET);

                        // Store the authToken in a cookie
                        res.cookie('authToken', authToken, { httpOnly: true });

                        return res.status(200).json({ success: true, authToken: authToken });
                    } else {
                        return res.status(400).json({
                            success: false,
                            error: "Please try to login with correct credentials"
                        });
                    }
                });
            } else {
                return res.status(400).json({
                    success: false,
                    error: "No user with that email address"
                });
            }
        }
    );
};


const register = async (req, res) => {
    const { name, email, password, bio, phone } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(password, salt);

        const emailCheckQuery = {
            text: `SELECT * FROM users WHERE user_email = $1`,
            values: [email]
        };

        const emailCheckResult = await client.query(emailCheckQuery);

        if (emailCheckResult.rows.length > 0) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const insertUserQuery = {
            text: `INSERT INTO users (user_name, user_email, user_password, user_bio, user_mobile)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING user_id, user_password`,
            values: [name, email, secPass, bio, phone]
        };

        await client.query(insertUserQuery,(err, results)=>{
            const user_id =  results.rows[0].user_id;
            
            const authToken = jwt.sign({ user: { user_id } }, JWT_SECRET);
            
            // Store the authToken in a cookie
            res.cookie('authToken', authToken, { httpOnly: true });
            
            return res.status(200).json({
                message: "You are now registered. Please log in",
                authToken: authToken
            });
        });
    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const logout = (req, res) => {

    res.clearCookie('authToken');
    res.redirect('/users/login');
    return res.status(200).json({ message: "You have been logged out" });
};
  


module.exports = { login, register, logout }