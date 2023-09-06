const community_trips_cache = new Set();
const community_cache = [];
//TODO: create a community cache
//TODO: return results using the utils defined by Varun
const client = require("../config/configDB");


const getAllCommunities = async (req, res) => {
    client.query("SELECT * FROM communities", function(error, results,) {
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

const createCommunity = async (req, res) => {
    client.query(
        "INSERT INTO communities (community_name, community_desc) VALUES ($1, $2 )",
        [
            req.body.community_name,
            req.body.community_desc,
        ],
        function(error, results) {
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
const getCommunityById = async (req, res) => {


    client.query("SELECT *  FROM communities WHERE community_id = $1"
        , [req.params.community_id],
        function(error, results) {
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
const updateCommunity = async (req, res) => {
    client.query(
        "UPDATE communities SET community_name = $1, community_desc= $2 WHERE community_id =$3",
        [
            req.body.community_name,
            req.body.community_desc,
            req.params.community_id
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

const deleteCommunity = async (req, res) => {
    client.query(
        "DELETE FROM communities WHERE community_id = $1",
        [req.params.community_id],
        function(error, results) {
            if (!error) {
                res.status(204).json({ code: 204, message: "community deleted successfully" });
            } else {
                res.status(400).json({
                    code: 400,
                    message: "community not found",
                });
            }
        }
    );
};

const getAllTripsOfCommunity = async (req, res) => {

    client.query(`
SELECT trips.*
FROM trips
INNER JOIN community_trips ON trips.trip_id = community_trips.trip_id
WHERE community_trips.community_id = $1;
`
        , [req.params.community_id],

        function(error, results) {
            if (!error && results.rows.length != 0) {
                res.status(201).send(results);
            } else if (results.rows.length == 0) {
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

const addTripToCommunity = async (req, res) => {

    const entryIsInDB = await tableContainsLink("community_trips", req.params.community_id, req.params.trip_id, community_trips_cache)
    if (entryIsInDB) {
        res.status(400).json({ code: 400, message: "trip already part of community" })

    }
    else {
        client.query(
            "INSERT INTO community_trips (community_id, trip_id) VALUES ($1,$2)", [req.params.community_id, req.params.trip_id],
            function(error, results) {
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
}

const removeTripFromCommunity = async (req, res) => {


    if (!communityContainsTrip(req.params.community_id, req.params.trip_id)) {
        res.status(404).json({ code: 404, message: "trip not part of community" })
    }

    client.query(
        "DELETE FROM community_trips WHERE community_id = $1 AND trip_id = $2",
        [req.params.community_id, req.params.trip_id],
        function(error, results) {
            if (!error) {
                removeElementFromSet(community_trips_cache, String(req.params.community_id) + "-" + String(req.params.trip_id))
                res.status(204).json({
                    code: 204,
                    message: "trip removed from the community successfully"
                });
            } else {
                console.log(error)
                res.status(500).json({
                    code: 500,
                    message: "unexpected error",
                });
            }
        }
    );


}



// Utilities


const tableContainsLink = async (tableName, id1, id2, cacheName) => {
    let contains = false;
    const isInCache = cacheName.has(String(id1) + '-' + String(id2));
    if (isInCache) {
        contains = true;
    } else {
        try {
            const results = await client.query(
                `SELECT * FROM ${tableName} WHERE ${id1} = $1 AND ${id2} = $2`,
                [id1, id2]
            );
            if (results.rows.length !== 0) {
                contains = true;
                cacheName.add(String(id1) + '-' + String(id2));
            } else {
                contains = false;
            }
        } catch (error) {
            console.log(
                `Error occurred while checking if entry already exists in ${tableName} table: ` +
                    error
            );
        }
    }
    return contains;
};

const communityContainsTrip = async (community_id, trip_id) => {
    let contains = false;
    const isInCache = community_trips_cache.has(String(community_id) + '-' + String(trip_id))
    if (isInCache) {
        contains = true;
    }
    else {
        try {
            const results = await client.query("SELECT * FROM community_trips WHERE community_id = $1 AND trip_id = $2",
                [community_id, trip_id])
            if (results.rows.length != 0) {
                contains = true
                community_trips_cache.add(String(community_id) + '-' + String(trip_id))
            }
            else if (results.rows.length == 0) {
                contains = false
            }

        }
        catch (error) {
            console.log("error occurred while checking if entry already exists in community_trips table" + error)
        }
    }

    return contains;
}


function removeElementFromSet(set, elementToRemove) {
    if (set.has(elementToRemove)) {
        set.delete(elementToRemove);
    }
    return set;
}

module.exports = { createCommunity, getAllCommunities, getCommunityById, deleteCommunity, updateCommunity, getAllTripsOfCommunity, removeTripFromCommunity, addTripToCommunity }
