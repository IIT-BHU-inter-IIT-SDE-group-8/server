const {pool} = require('../dbConfig')
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'AdityaIsagoodb$oy'
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client({
    clientId: '515774685184-judv39nhmvssuseo283vd13ji7d2d4eh.apps.googleusercontent.com',
    clientSecret: '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',
    redirectUri: 'http://localhost:3000/auth/google/callback',
});

const auth = (req, res) => {
    res.redirect(googleClient.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
    }));
};

const callback = async (req, res) => {
    console.log("I am called")
    try {
        const { code } = req.query;
        const { tokens } = await googleClient.getToken(code);

        // Get user information from Google
        const userResponse = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: "515774685184-judv39nhmvssuseo283vd13ji7d2d4eh.apps.googleusercontent.com",
            url: 'https://www.googleapis.com/oauth2/v2/userinfo',
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
            },
        });

        const { email, name, at_hash } = userResponse.payload;

        // Check if the user already exists in your database
        const userQuery = await pool.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );

        if (userQuery.rows.length > 0) {
            const user = userQuery.rows[0];
            const data = {
                user: {
                    id: user.user_id,
                }
            }
            const authToken = jwt.sign(data, JWT_SECRET);
            return res.json({ success: true, authToken });
        }

        // If the user doesn't exist, create a new user
        const newUserQuery = await pool.query(
            `INSERT INTO users (username, email, user_password, user_bio)
         VALUES ($1, $2, $3, $4)
         RETURNING user_id`,
            [name, email, at_hash, "default"]
        );

        const newUser = newUserQuery.rows[0];
        const data = {
            user: {
                id: newUser.user_id,
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);

        return res.json({ success: true, authToken });

    } catch (error) {
        console.error("Google authentication error:", error);
        res.status(500).json({ error: 'Internal Server error' });
    }
}

module.exports = { auth, callback };