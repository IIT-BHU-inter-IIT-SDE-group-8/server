const client = require("../config/configDB");
const { removeElementFromSet } = require("../utils/cache");
const community_requests_cache = new Set()
const tableContainsLink = require("../utils/tabelContainsLink");


// TODO: Add all the error checking like, check if the user is admin or not, if he already is part of the community or not, etc.

function getAllCommunityRequests() {

    client.query("SELECT * FROM community_requests", (err, results) => {
        if (!err) {
            res.status(200).json(results)
        }
        else {
            res.status(500).json({ status: 500, message: "unknown error occurred while fetching all the requests" })

        }
    })
}

function getCommunityRequestById() {

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

function getAllInvitesById() {

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


function getAllRequestsById() {

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

async function createCommunityRequest() {
    const requestAlreadyExists = await tableContainsLink("community_requests", "user_id", "community_id", req.body.user_id, req.body.community_id, community_requests_cache)
    if (requestAlreadyExists) {
        res.status(400).json({ status: 400, message: "The request object already exists" })
    }
    else {
        client.query("INSERT INTO community_requests (user_id, community_id, admin_id, request_type) VALUES ($1, $2, $3, $4)",
            [req.body.user_id, req.body.community_id, req.body.admin_id, req.body.request_type],
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



async function deleteCommunityRequestById() {
    const requestAlreadyExists = await tableContainsLink("community_requests", "user_id", "community_id", req.body.user_id, req.body.community_id, community_requests_cache)

    if (requestAlreadyExists) {

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
const updateCommunityRequest = async (req, res) => {
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
    getAllCommunityRequests, getCommunityRequestById, createCommunityRequest, deleteCommunityRequestById, updateCommunityRequest,
    getAllInvitesById, getAllRequestsById
}
