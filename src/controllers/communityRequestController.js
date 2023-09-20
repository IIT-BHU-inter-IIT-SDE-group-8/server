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

function getCommunityRequestObjectById() {

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

function getAllInviteObjectsById() {

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


function getAllRequestObjectsById() {

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
    const requestAlreadyExists = await tableContainsLink("community_requests", "user_id", "community_id", req.body.user_id, req.body.community_id, community_requests_cache)
    const userAlreadyPartOfCommunity = await tableContainsLink("community_users", "community_id", "user_id", req.body.community_id, req.body.user_id, community_users_cache)

    //we can let the client input the admin id, but it might be wrong so we would anyway have to verify if the admin id belongs to the
    //community, so instead of that we are implicity getting the admin id from the community_id sent in the request

    const admin_id = await adminLookup(req.body.community_id)
    if (userAlreadyPartOfCommunity || req.body.user_id == admin_id) {
        res.status(400).json({ status: 400, message: "Invalid request: User is already part of the community or They are the admin" })
    }
    else if (requestAlreadyExists) {
        res.status(400).json({ status: 400, message: "Invalid request: The request object already exists, withdraw it, or wait till it is accepted/denied" })
    }
    else {
        client.query("INSERT INTO community_requests (user_id, community_id, admin_id, request_type) VALUES ($1, $2, $3, $4)",
            [req.body.user_id, req.body.community_id, admin_id, req.body.request_type],
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

        client.query("DELETE FROM community_requests WHERE request_id = $1 RETURNING *", [req.params.request_id],

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
        "UPDATE community_request SET user_id = $1, community_id = $2 WHERE admin_id =$3",
        [
            req.body.user_id,
            req.body.community_id,
            req.params.admin_id,
            req.body.request_type
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

module.exports = {
    getAllCommunityRequestObjects, getCommunityRequestObjectById, createCommunityRequestObject, deleteCommunityRequestObjectById, updateCommunityRequestObject,
    getAllInviteObjectsById, getAllRequestObjectsById
}

