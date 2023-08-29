const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const client = require('../config/configDB.js');
const JWT_SECRET = process.env.JWT_SECRET
const sendTrue = require('../utils/sendTrue.js');
const { ErrorHandler } = require("../../middleware/error.js");

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const emailCheckQuery = {
            text: `SELECT * FROM users WHERE user_email = $1`,
            values: [email]
        };
        const emailCheckResult = await client.query(emailCheckQuery);
        const results = emailCheckResult.rows
        if (results.length > 0) {
            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.user_password)
            if (isMatch) {
                const data = {
                    user: {
                        id: user.user_id
                    }
                };
                const authToken = jwt.sign(data, JWT_SECRET);

                // Store the authToken in a cookie
                res.cookie('authToken', authToken, { httpOnly: true });

                return sendTrue(res, 200, "Login successful");
            } else {
                return next(new ErrorHandler("Please try to login with correct credentials",401));
            }
        } else {
            return next(new ErrorHandler("No user exists with that email address",404));
        }
    } catch (error) {
        next(error);
    }
};


const register = async (req, res, next) => {
    try {
        const { name, email, password, bio, phone } = req.body;
        const secPass = await bcrypt.hash(password, 10);

        const emailCheckQuery = {
            text: `SELECT * FROM users WHERE user_email = $1`,
            values: [email]
        };

        const emailCheckResult = await client.query(emailCheckQuery);
        if (emailCheckResult.rows.length > 0) {
            return next(new ErrorHandler("Email already registered",400));
        }

        const insertUserQuery = {
            text: `INSERT INTO users (user_name, user_email, user_password, user_bio, user_mobile)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING user_id, user_password`,
            values: [name, email, secPass, bio, phone]
        };

        await client.query(insertUserQuery);

        const authToken = jwt.sign({ user: { email } }, JWT_SECRET);

        // Store the authToken in a cookie
        res.cookie('authToken', authToken, { httpOnly: true });
        return sendTrue(res, true, 201, "You are now registered. Please log in");
    } catch (error) {
        next(error);
    }
};

const logout = (req, res, next) => {
    try {
        res.clearCookie('authToken');
        res.redirect('/users/login');
    } catch (error) {
        next(error);
    }

};


module.exports = { login, register, logout }