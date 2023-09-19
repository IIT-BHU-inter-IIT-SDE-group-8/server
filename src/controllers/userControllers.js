const { client } = require('../config/configDB')
const bcrypt = require("bcrypt");
const user_trip_cache = new Set()
const tableContainsLink = require("../utils/tabelContainsLink")
const { removeElementFromSet } = require("../utils/cache")

const getAllUsers = async (res, req, next) => {
    try {
        client.query(`SELECT * from users`, (err, results) => {
            console.log(results.rows);
        })
    } catch (error) {
        next(error);
    }
}
const getUserById = (res, req) => {

    const auth_user_id = req.user.id;

    if(auth_user_id === req.params.user_id)
    {
        client.query("SELECT * FROM users WHERE user_id = $1", [req.params.user_id]
            , (error, result) => {

            if (!error) {
                res.status(200).json(result)
            }
            else {
                res.status(500).json({ status: 500, message: "Unknown error while getting user by Id" })
            }
        })
    }
    else
    {
        res.status(401).json({ message: "Cannot get user" });
    }
    
}

const updateUser = async (req, res, next) => {
    const user_id = req.params.user_id;
    const auth_user_id = req.user.id;
    const { name, email, password, bio, phone } = req.body;
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(password, salt);
    try {
        if (user_id === auth_user_id) {
            client.query(`
            UPDATE users SET user_name = $1, user_email = $2, user_password = $3, user_bio = $4, user_mobile = $5
            WHERE user_id = $6
        `, [name, email, secPass, bio, phone, user_id], (err, results) => {
                if (err) {``
                    throw err;
                }
            })
            res.status(200).json({ message: "User updated successfully." })
        } else {
            res.status(401).json({ message: "Cannot update user" })
        }
        
    } catch (error) {
        next(error);
    }
}

const deleteUser = async (req, res, next) => {
    const user_id = req.params.user_id;
    const auth_user_id = req.user.id;
    try {
        if (user_id === auth_user_id) {
            client.query(`
            DELETE FROM users WHERE user_id = $1
            `, [user_id], (err, results) => {
                if (err) {
                    throw err;
                }
            })
            res.status(200).json({ message: "User deleted successfully." })
        } else {
            res.status(401).json({ message: "Cannot delete user" });
        }
        
    } catch (error) {
        next(error);
    }
}

//TODO: alter this function according to the new spec, which includes admin_id the id of the user who created the trip
const link_user_to_trip = async (req, res, next) => {

    const user_id = req.params.user_id;
    const trip_id = req.params.trip_id;
    const auth_user_id = req.params.id;
    const entryIsInDB = await tableContainsLink("user_trip", user_id, trip_id, user_trip_cache)

    if (entryIsInDB) {
        res.status(400).json({ code: 400, message: "User already part of trip" })

    }
    else {
        try {
            if (auth_user_id === user_id) {
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
    
                            return client.query(addUserToTripQuery, [user_id, trip_id]);
                        } else {
                            console.log("The user and the admin are not friends.");
    
                            // If they are not friends, store the join request
                            const storeJoinRequestQuery = `
                            INSERT INTO join_requests (user_id, trip_id) VALUES ($1, $2);
                            `;
    
                            return client.query(storeJoinRequestQuery, [user_id, trip_id]);
                        }
                    })
                    .then(() => {
                        console.log("Query executed successfully!");
                    })
                    .catch(error => {
                        console.error("Error executing query:", error);
                    });
            } else {
                res.status(401).json({ message: "Cannot link user" });
            }

        } catch (error) {
            next(error);
        }
    }
}

const getAllTripsOfUser = (req, res) => {

    const user_id = req.params.user_id;
    const auth_user_id = req.params.id;

    if(auth_user_id === user_id)
    {
        client.query(`SELECT trips.*
        FROM trips
        INNER JOIN user_trip ON trips.trip_id = user_trip.trip_id
        WHERE user_trip.user_id = $1;
    `, [user_id],
        (error, result) => {
            if (!error) {
                res.status(200).json(result)
            }
            else {
                res.status(500).json({ status: 500, message: "Unknown error while getting all the trips of user" })
            }
        })
    }
    else
    {
        res.status(401).json({ message: "Cannot get trips user" });
    }
    
}

const unlinkTripAndUser = (req, res) => {

    const user_id = req.params.user_id;
    const auth_user_id = req.user.id;

    if(user_id === auth_user_id)
    {
        if (!tableContainsLink("user_trip",user_id , req.params.trip_id, user_trip_cache)) {
            res.status(404).json({ code: 404, message: "trip not part of community" })
        }
    
        client.query("DELETE FROM user_trip WHERE user_id= $1 AND trip_id = $2", [user_id, req.params.trip_id]
            , (error, result) => {
                if (!error) {
                    removeElementFromSet(user_trip_cache, String(user_id) + "-" + String(req.params.trip_id))
    
                    res.status(204).json({ code: 204, message: "User and trip unlinked successfully" });
                } else {
                    res.status(400).json({
                        code: 400,
                        message: "User and trip link not found",
                    });
                }
            })
    }
    else
    {
        res.status(401).json({ message: "Cannot unlink user" });
    }
    
}

module.exports = { getAllTripsOfUser, unlinkTripAndUser, getUserById, getAllUsers, updateUser, deleteUser, link_user_to_trip};
