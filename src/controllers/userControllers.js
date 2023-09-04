const { client } = require('../config/configDB')
const bcrypt = require("bcrypt");

const getAllUsers = async (req, res, next) => {
    try {
        // Assuming you have established a connection to your database (e.g., PostgreSQL) and assigned it to the 'client' variable
        client.query(`SELECT * from users`, (err, results) => {
            if (err) {
                return next(err);
            }
            
            // Send the results as a JSON response
            res.status(200).json({ result: results.rows });
        });
    } catch (error) {
        next(error);
    }
};


const updateUser = async (req, res, next) => {
    const user_id = req.param.user_id;
    const {name, email, password, bio, phone} = req.body;
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(password, salt);
    try {
        client.query(`
        UPDATE users SET user_name = $1, user_email = $2, user_password = $3, user_bio = $4, user_mobile = $5 
        WHERE user_id = $6
        `,[name, email, secPass, bio, phone, user_id],(err, results)=>{
            if(err)
            {
                throw err;
            }
        })
        res.status(200).json({message: "User updated successfully."})
    } catch (error) {
        next(error);
    }
}

const deleteUser = async (req, res, next) => {
    const user_id = req.param.user_id;
    try {
        client.query(`
        DELETE FROM users WHERE user_id = $1  
        `,[user_id],(err, results) => {
            if(err)
            {
                throw err;
            }
        })
        res.status(200).json({message:"User deleted successfully."})
    } catch (error) {
        next(error);
    }
}

const link_user_to_trip = async (req, res, next) => {
    const user_id = req.param.user_id;
    const trip_id = req.param.trip_id;
    try {
    const findAdminQuery = `
        SELECT user_id
        FROM user_trip
        WHERE trip_id = $1 AND is_admin = TRUE;
    `;

    // Check if the admin and the user are friends
    const checkFriendshipQuery = `
        SELECT 1
        FROM friendship
        WHERE (user1_id = $1 AND user2_id = $2)
        OR (user1_id = $2 AND user2_id = $1)
        LIMIT 1;
    `;


    client.query(findAdminQuery, [trip_id])
        .then(adminResult => {
            if (adminResult.rows.length === 0) {
                console.log("Admin not found for the trip.");
                return;
            }

            const adminUser_id = adminResult.rows[0].user_id;

            // Check if the admin and the user are friends
            return client.query(checkFriendshipQuery, [adminUser_id, user_id]);
        })
        .then(friendshipResult => {
            if (friendshipResult && friendshipResult.rows.length > 0) {
                console.log("The user and the admin are friends.");
                
                // If they are friends, add the user to the trip with is_admin as false
                const addUserToTripQuery = `
                    INSERT INTO user_trip (user_id, trip_id, is_admin) VALUES ($1, $2, FALSE);
                `;
                res.status(200).json({message:"User to linked to trip successfully"})
                return client.query(addUserToTripQuery, [user_id, trip_id]);
            } else {
                console.log("The user and the admin are not friends.");
                
                // If they are not friends, store the join request
                const storeJoinRequestQuery = `
                    INSERT INTO join_requests (user_id, trip_id) VALUES ($1, $2);
                `;
                res.status(200).json({message:"User to linked to trip successfully"})
                return client.query(storeJoinRequestQuery, [user_id, trip_id]);
            }
        })
        .then(() => {
            console.log("Query executed successfully!");
        })
        .catch(error => {
            console.error("Error executing query:", error);
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {getAllUsers, updateUser, deleteUser, link_user_to_trip};
