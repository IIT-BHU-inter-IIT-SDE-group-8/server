const { client } = require("../config/configDB");
const { removeElementFromSet } = require("../utils/cache");
const friendRequestLookup = require("../utils/friendRequestLookup");
const friend_requests_cache = new Set()
const tableContainsLink = require("../utils/tabelContainsLink");
const friendship_cache = new Set()


const getAllFriendRequestObjectsByUserId = (req, res) => {
    client.query(`
    SELECT * FROM friend_requests
    WHERE user1_id = $1 or user2_id = $1
    `, [req.user.id], (err, results) => {
        if (err) {
            return res.status(500).json({ status: 500, message: "unknown error occurred while fetching all the requests" })
        }
        else if (results.rows[0].length !== 0) {
            return res.status(200).json(results)
        }
        else {
            return res.status(400).json({ status: 400, message: "No friend requests were found" });
        }
    })
}

async function createFriendRequestObject(req, res, next) {
    try {
        const { user1_id, user2_id } = req.body
        if (req.user.id !== user1_id && req.user.id !== user2_id) {
            return res.status(404).json({ status: 404, message: "User is not allowed to perform this operation" })
        }
        const requestAlreadyExists = await tableContainsLink("friend_requests", "user1_id", "user2_id", user1_id, user2_id, friend_requests_cache)
        const usersAlreadyFriends = friendship_cache.has(String(user1_id) + '-' + String(user2_id))

        if (usersAlreadyFriends) {
            res.status(400).json({ status: 400, message: "Invalid request: Users are already friends" })
        }
        else if (requestAlreadyExists) {
            res.status(400).json({ status: 400, message: "Invalid request: The request object already exists, withdraw it, or wait till it is accepted/denied" })
        }
        else {

            client.query("INSERT INTO friend_requests (user1_id, user2_id, request_status) VALUES ($1, $2, $3) RETURNING *",
                [user1_id, user2_id, "pending"],
                (err, results) => {
                    if (!err) {
                        res.status(201).json(results.rows)
                    }
                    else {
                        console.log(err)
                        res.status(500).json({
                            status: 500, message: "unknown error occurred while creating friend request object"
                        })
                    }
                }
            )
        }
    } catch (error) {
        next(error)
    }
}


async function deleteFriendRequestObjectById(req, res) {
    const request = await friendRequestLookup(req.params.friend_request_id)
    const {user1_id, user2_id} = request;
    const requestExists = await tableContainsLink("friend_requests", "user1_id", "user2_id", user1_id, user2_id, friend_requests_cache)

    if (requestExists) {

        if (req.user.id == user1_id || req.user.id == user2_id) {

            client.query("DELETE FROM friend_requests WHERE request_id = $1 RETURNING *", [req.params.friend_request_id],

                (err, results) => {
                    if (!err) {
                        res.status(200).json({
                            status: 200, message: "request object deleted successfully"
                        })
                        removeElementFromSet(friend_requests_cache, String(results.rows[0].user1_id) + "-" + String(results.rows[0].user2_id))
                    }
                    else {
                        res.status(500).json({
                            status: 500, message: "unknown error occurred while deleting request object"
                        })
                    }
                }
            )

        }
        else {
            res.status(400)
                .json({ status: 400, message: "Invalid request: Only the users who are friends related to the request can perform this action" })
        }

    }
    else {
        res.status(400).json({ status: 400, message: "Invalid request: No such community request object" })
    }
}

const updateFriendRequestStatus = async (req, res,next) => {

    try {
        const setRequestStatus = req.headers.set_request_status;
        const requestId = req.params.friend_request_id;
        const callerId = req.user.id
        const request = await friendRequestLookup(requestId)
        const { user1_id, user2_id, request_status } = request
        if (request_status == "pending") {
            try {
                if (callerId !== user1_id && callerId !== user2_id) {
                    return res.status(404).json({ status: 404, message: "User is not allowed to perform this operation" })
                }
                if (setRequestStatus !== "accepted" && setRequestStatus !== "rejected" && setRequestStatus !== "pending") {
                    return res.status(400).json({ status: 400, message: `Invalid request_status: ${setRequestStatus}, should either be "accepted", "rejected" or "pending"` });
                }
                else {
                    if (setRequestStatus == "accepted") {
                        await client.query(
                            `INSERT INTO friendship (user1_id, user2_id)
                            SELECT $1, $2
                            WHERE NOT EXISTS (
                                SELECT 1 FROM friendship
                                WHERE user1_id = $1 AND user2_id = $2
                            );`, [user1_id, user2_id]
                        );
                        friendship_cache.add(String(user1_id) + '-' + String(user2_id))
                        res.status(201).json({ status: 201, message: `Users successfully added as friends` });
                    } else if (setRequestStatus === "rejected") {
                        let other_user_id = req.user.id === user1_id ? user2_id : user1_id;
                        removeElementFromSet(friend_requests_cache, String(user1_id) + String(user2_id))
                        removeElementFromSet(friend_requests_cache, String(user2_id) + String(user1_id))
                        res.status(200).json({ status: 200, message: `User of user_id: ${other_user_id} has been rejected` });
                    }else {
                        res.status(200).json({ status: 200, message: "Request is already in pending"})
                    }
                    await client.query(
                        "UPDATE friend_requests SET request_status = $1 WHERE request_id = $2",
                        [setRequestStatus, requestId]
                    );
                }
            } catch (err) {
                console.error(err);
                res.status(500).json({ status: 500, message: "Unknown error occurred while processing request" });
            }
        }
        else {
            res.status(400).send({ status: 400, message: "Invalid request: Can only change the status of a request that is 'pending'" })
        }
    } catch (error) {
        next(error)
    }
};

module.exports = {
    getAllFriendRequestObjectsByUserId, createFriendRequestObject, deleteFriendRequestObjectById,
    updateFriendRequestStatus
}
