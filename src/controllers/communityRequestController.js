const client = require("../config/configDB");
const { adminLookup } = require("../utils/adminLookup");
const { removeElementFromSet } = require("../utils/cache");
const community_requests_cache = new Set()
const tableContainsLink = require("../utils/tabelContainsLink");
const { community_users_cache } = require("./communityController");


// TODO: Add all the error checking like, check if the user is admin or not, if he already is part of the community or not, etc.

function getAllCommunityRequestObjects() {

    client.query("SELECT * FROM community_requests", (err, results) => {
        if (!err) {
            res.status(200).json(results)
        }
        else {
            res.status(500).json({ status: 500, message: "unknown error occurred while fetching all the requests" })

        }
    })
}

function getCommunityRequestObjectByRequestId() {

    client.query("SELECT * FROM community_requests WHERE request_id = $1", [req.params.request_id],
        (err, results) => {
            if (!err) {
                res.status(200).json(results)
            }
            else {
                res.status(500).json({ status: 500, message: "unknown error while fetching community request by id" })
            }
        }
    )
}

function getAllInviteObjectsByUserId() {

    client.query("SELECT * FROM community_requests WHERE user_id = $1 AND request_type = $2",
        [req.params.user_id, "invite"],
        (err, results) => {
            if (!err) {
                res.status(200).json(results)
            }
            else {
                res.status(500).json({ status: 500, message: "unknown error occurred while fetching invites by id" })
            }
        }
    )

}


function getAllRequestObjectsByAdminId() {

    client.query("SELECT * FROM community_requests WHERE admin_id = $1 AND request_type = $2",
        [req.params.user_id, "request"],
        (err, results) => {
            if (!err) {
                res.status(200).json(results)
            }
            else {
                res.status(500).json({ status: 500, message: "unknown error occurred while requests invites by id" })
            }
        }
    )

}

//TODO: Admin can only issue to a new user, user can only request if he is not already part of the community and he is not the admin
async function createCommunityRequestObject() {
    const { user_id, request_type, community_id } = req.body
    const requestAlreadyExists = await tableContainsLink("community_requests", "user_id", "community_id", user_id, community_id, community_requests_cache)
    const userAlreadyPartOfCommunity = await tableContainsLink("community_users", "community_id", "user_id", community_id, user_id, community_users_cache)

    //we can let the client input the admin id, but it might be wrong so we would anyway have to verify if the admin id belongs to the
    //community, so instead of that we are implicity getting the admin id from the community_id sent in the request

    const admin_id = await adminLookup(req.body.community_id)

    if (userAlreadyPartOfCommunity || user_id == admin_id) {
        res.status(400).json({ status: 400, message: "Invalid request: User is already part of the community or They are the admin" })
    }
    else if (requestAlreadyExists) {
        res.status(400).json({ status: 400, message: "Invalid request: The request object already exists, withdraw it, or wait till it is accepted/denied" })
    }
    else {
        client.query("INSERT INTO community_requests (user_id, community_id, admin_id, request_type, request_status) VALUES ($1, $2, $3, $4, $5)",
            [user_id, community_id, admin_id, request_type, "pending"],
            (err, results) => {
                if (!err) {
                    res.status(201).json(results)
                }
                else {
                    res.status(500).json({
                        status: 500, message: "unknown error occurred while creating community request object"
                    })
                }
            }
        )
    }
}


//TODO; only the user or the admin can perform this function
async function deleteCommunityRequestObjectById() {
    const requestExists = await tableContainsLink("community_requests", "user_id", "community_id", req.body.user_id, req.body.community_id, community_requests_cache)

    if (requestExists) {

        // pseudo code: if(req.user.id != req.body.user_id || req.user.id != admin_id)

        client.query("DELETE FROM community_requests WHERE request_id = $1 RETURNING *", [req.params.community_request_id],

            (err, results) => {
                if (!err) {
                    res.status(204).json({
                        status: 204, message: "request object deleted successfully"
                    })
                    removeElementFromSet(community_requests_cache, String(results.rows[0].user_id) + "-" + String(results.rows[0].community_id))
                }
                else {
                    res.status(500).json({
                        status: 500, message: "unknown error occurred while deleting request object"
                    })
                }
            }
        )

    }

}
const updateCommunityRequestObject = async (req, res) => {
    client.query(
        "UPDATE community_request SET user_id = $1, community_id = $2 , admin_id =$3, request_type = $4, request_status = $5 WHERE request_id = $5",
        [
            req.body.user_id,
            req.body.community_id,
            req.body.admin_id,
            req.body.request_type,
            req.params.community_request_id

        ],
        function(error, results) {
            if (!error) {
                res.status(204).send(results);
            }
            else {
                res.status(400).json({ code: 400, message: "invalid input", })
            }
        }
    );
};

const updateCommunityRequestStatus = async (req, res) => {

    const requestStatus = req.headers.request_status;
    const requestId = req.params.community_request_id;
    const { community_id, user_id, request_type, admin_id } = req.body;

    let isValidRequest
    //only admin can accept a request and only the user can accept the invite
    if ((request_type == "request" && req.user.id == admin_id) || (request_type == "invite" && req.user.id == user_id)) {
        isValidRequest = true
    }
    else {
        isValidRequest = false
    }

    try {

        if (requestStatus !== "accepted" && requestStatus !== "rejected" && requestStatus !== "pending") {
            return res.status(400).json({ status: 400, message: `Invalid request_status: ${requestStatus}, should either be "accepted", "rejected" or "pending"` });
        }

        const updateResult = await client.query(
            "UPDATE community_request SET request_status = $1 WHERE request_id = $2",
            [requestStatus, requestId]
        );

        if (requestStatus === "accepted") {
            await client.query(
                "INSERT INTO community_users (community_id, user_id) VALUES ($1, $2)",
                [community_id, user_id]
            );

            res.status(204).json({ status: 204, message: `User successfully added to the community of community_id: ${community_id}` });
        } else if (requestStatus === "rejected") {
            res.status(204).json({ status: 204, message: `User request to join community of community_id: ${community_id} has been rejected` });
        } else {
            res.status(400).json({ status: 400, message: `Invalid request_status: ${requestStatus}, should either be "accepted", "rejected" or "pending"` });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: "Unknown error occurred while processing request" });
    }
};

module.exports = {
    getAllCommunityRequestObjects, getCommunityRequestObjectByRequestId, createCommunityRequestObject, deleteCommunityRequestObjectById, updateCommunityRequestObject,
    getAllInviteObjectsByUserId, getAllRequestObjectsByAdminId, updateCommunityRequestStatus
}

