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

    const user_id = parseInt(req.params.user_id, 10);
    const trip_id = parseInt(req.params.trip_id, 10);
    const auth_user_id = req.user.id;
    const entryIsInDB = await tableContainsLink("user_trip", user_id, trip_id, user_trip_cache)

    if (entryIsInDB) {
        res.status(400).json({ code: 400, message: "User already part of trip" })
    }
    else {
        try {
            if (auth_user_id === user_id) {

                client.query(`INSERT INTO trip_join_requests (user_id, trip_id) VALUES ($1, $2)`,[user_id, trip_id]);

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
