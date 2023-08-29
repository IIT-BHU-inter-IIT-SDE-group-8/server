const community_trips_cache = [];
const community_cache = [];
//TODO: create a community cache




const client = require("../config/configDB");


export const getAllCommunities = async (req, res) => {
    client.query("SELECT * FROM communities", function(error, results, fields) {
        if (!error) {
            res.status(200).json(results);
        } else {
            res.status(500).json({
                code: 500,
                message: "unexpected error",
            });
        }
    });
};

export const createCommunity = async (req, res) => {
    client.query(
        "INSERT INTO communities (community_name, community_desc) VALUES ($1, $2 )",
        [
            req.body.community_name,
            req.body.community_desc,
        ],
        function(error, results, fields) {
            if (!error) {
                res.status(201).send(results);
            } else {
                console.log(error);
                res.status(500).json({
                    code: 500,
                    message: "unexpected error",
                });
            }
        }


    )
}
export const getCommunityById = async () => {


    client.query("SELECT *  FROM communities WHERE community_id = $1"
        , [req.params.community_id],
        function(error, results, fields) {
            if (!error) {
                res.status(200).json(results);
            } else {
                res.status(404).json({
                    code: 404,
                    message: "community not found ",
                })
            }
        })
}
export const updateCommunity = async (req, res) => {
    client.query(
        "UPDATE communities SET community_name = $1, community_desc= $2 WHERE id =$3",
        [
            req.body.community_name,
            req.body.community_desc,
            req.params.community_id
        ],
        function(error, results, fields) {
            if (!error) {
                res.status(204).send(results);
            } else if (results.length == 0) {
                res.status(404).json({
                    code: 404,
                    message: "community not found",
                });
            } else {
                res.status(400).json({ code: 400, message: "invalid input", })
            }
        }
    );
};

export const deleteCommunity = async (req, res) => {
    client.query(
        "DELETE FROM communities WHERE id = $1",
        [req.params.community_id],
        function(error, results, fields) {
            if (!error) {
                res.status(204);
            } else {
                res.status(400).json({
                    code: 400,
                    message: "community not found",
                });
            }
        }
    );
};

export const getAllTripsOfCommunity = async (req, res) => {


    client.query("SELECT trip_id FROM community_trips WHERE community_id = $1"
        , [req.params.community_id],

        function(error, results, fields) {
            if (!error && results.length() != 0) {
                res.status(201).send(results);
            } else if (results.length() == 0) {
                res.status(400).json({
                    code: 400,
                    message: "no trips present in the community",
                });
            } else {
                console.log(error);
                res.status(500).json({
                    code: 500,
                    message: "unknown error occurred",
                });

            }
        }
    )
}

export const addTripToCommunity = async (req, res) => {

    if (communityContainsTrip(req.params.community_id, req.params.trip_id)) {

        res.status(400).json({ code: 400, message: "trip already part of community" })

    }

    client.query(
        "INSERT INTO community_trips WHERE community_id = $1, trip_id = $2", [req.params.community_id, req.params.trip_id],
        function(error, results, fields) {
            if (!error) {
                res.status(201).send(results);
            } else {
                console.log(error);
                res.status(400).json({
                    code: 400,
                    message: "invalid input",
                });
            }
        }
    )
}

export const removeTripFromCommunity = async (req, res) => {


    if (!communityContainsTrip(req.params.community_id, req.params.trip_id)) {
        community_trips_cache = removeStringFromArray(community_trips_cache, string(req.params.community_id) + "-" + string(req.params.trip_id))
        res.status(404).json({ code: 404, message: "trip not part of community" })
    }

    client.query(
        "DELETE FROM community_trips WHERE community_id = $1, trip_id = $2",
        [req.params.community_id, req.params.trip_id],
        function(error, results, fields) {
            if (!error) {
                res.status(204).json({
                    code: 204,
                    message: "trip removed from the community successfully"
                });
            } else {
                res.status(500).json({
                    code: 500,
                    message: "unexpected error",
                });
            }
        }
    );
}



// Utilities


const communityContainsTrip = async (community_id, trip_id) => {
    let contains = false;

    if (community_trips_cache.includes(string(community_id) + '-' + string(trip_id))) {
        contains = true;
    }
    else {

        client.query("SELECT * FROM community_trips WHERE community_id = $1, trip_id = $2",
            [community_id, trip_id], function(error, results, fields) {

                if (!error) {
                    contains = true
                    community_trips_cache.push(string(community_id) + '-' + string(trip_id))
                }
                else if (results.length != 0) {
                    contains = true
                    community_trips_cache.push(string(community_id) + '-' + string(trip_id))
                }
                else { contains = false }
            }
        )

    }
}


function removeStringFromArray(array, stringToRemove) {
    const index = array.indexOf(stringToRemove);

    if (index !== -1) {
        array.splice(index, 1);
    }

    return array;
}
