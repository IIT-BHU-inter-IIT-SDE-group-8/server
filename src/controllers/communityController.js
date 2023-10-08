const community_trips_cache = new Set();
const community_users_cache = new Set()
const community_cache = [];
//TODO: return results using the utils defined by Varun
//TODO: uncomment the line for community admin from the req.user
const {client} = require("../config/configDB");
const tableContainsLink = require("../utils/tabelContainsLink")
const { removeElementFromSet } = require("../utils/cache")
const { queryTrips, findAdmin, fetchGroupIds, tripAdminQuery } = require('./tripController');
const { ErrorHandler } = require('../middleware/error')
const communityAdminQuery = `SELECT community_admin_id FROM communities WHERE community_id = $1`;
const query = `SELECT community_id FROM user_community WHERE user_id = $1`;
const membersQuery = `SELECT user_id FROM user_community WHERE community_id = $1`;
let communityIds = new Set();
let userCommunityIds = new Set();
let memberIds = new Set();
let members_set = new Set();

const getAllCommunities = async (req, res, next) => {
    try {
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
    } catch (error) {
        next(error);
    }
};

const createCommunity = async (req, res) => {
    client.query(
        "INSERT INTO communities (community_name, community_desc, community_admin_id) VALUES ($1, $2 , $3)",
        [
            req.body.community_name,
            req.body.community_desc,
            req.user.id
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

const getCommunityById = async (req, res, next) => {

    const user_id = req.user.id;
    const community_id = parseInt(req.params.community_id,10);

    try {

            userCommunityIds = fetchGroupIds(user_id, query, communityIds);

            if(userCommunityIds.has(community_id)){
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
            } else {
                res.status(401).json({message:"cannot get community!!"});
            }
        
    } catch (error) {
        next(error);
    }
}

const updateCommunity = async (req, res) => {
    const auth_user_id = req.user.id;
    const community_id = parseInt(req.params.community_id,10); 

    try {
        const AdminId = findAdmin(communityAdminQuery, community_id)
        if(AdminId === auth_user_id)
        {
            client.query (
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
        }
        else
        {
            res.status(401).json({message:"Can't update community"});
        }
        
    } catch (error) {
        next(error);
    }
};

const deleteCommunity = async (req, res, next) => {

    const community_id = parseInt(req.params.community_id,10);
    const auth_user_id = req.user.id;

    try {
        const AdminId = findAdmin(communityAdminQuery, community_id)
        if(auth_user_id === AdminId)
        {
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
        } else {
            res.status(401).json({message : "can't delete the trip!!"})
        }
    } catch (error) {
        next(error);
    }
    
};

function findCommunityMembers(membersQuery, community_id, membersSet)
{
    return new Promise((resolve, reject) => {
        client.query(membersQuery, [community_id], (err, results) => {
            if(err){
                reject(err);
            } else {
                results.rows.forEach(ele => {
                    membersSet.add(ele.user_id);
                })
                resolve(membersSet);
            }
        })
    })
}

const getAllTripsOfCommunity = async (req, res, next) => {

    const tripIds = new Set();
    const community_id = parseInt(req.params.community_id, 10);
    const user_id = req.user.id;
    
    try {

        findCommunityMembers(membersQuery, community_id, members_set).then(member_Id => {
        if(member_Id.has(user_id))
        {
            let sqlQuery = `
            SELECT DISTINCT CT.trip_id
            FROM community_trip CT
            WHERE CT.community_id = ${community_id}
            `;

            client.query(sqlQuery, (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'An error occurred while querying the database' });
                }
                else if (results.rows.length == 0) {
                    res.status(400).json({
                        code: 400,
                        message: "no trips present in the community",
                    });
                }

                results.rows.forEach((row) => {
                    tripIds.add(row.trip_id);
                });

                queryTrips(req, res, tripIds);
            });
        }
     else {
            res.status(401).json({message: "can't get the trips!!"})
        }
    })
    } catch (error) {
        next(error);
    }
};

const addTripToCommunity = async (req, res, next) => {

    const entryIsInDB = await tableContainsLink("community_trips", "community_id", "trip_id", req.params.community_id, req.params.trip_id, community_trips_cache)

    res.json({ message: "received" })

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

    if (!tableContainsLink("community_trips", req.params.community_id, req.params.trip_id, community_trips_cache)) {
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

const getAllUsersOfCommunity = async (req, res) => {

    client.query(`
SELECT users.*
FROM users
INNER JOIN community_users ON users.user_id = community_users.user_id
WHERE community_users.community_id = $1;
`
        , [req.params.community_id],

        function(error, results) {
            if (!error && results.rows.length != 0) {
                res.status(201).send(results);
            } else if (results.rows.length == 0) {
                res.status(400).json({
                    code: 400,
                    message: "no users present in the community",
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

const addUserToCommunity = async (req, res) => {

    const entryIsInDB = await tableContainsLink("community_users", "community_id", "user_id", req.params.community_id, req.params.user_id, community_users_cache)

    res.json({ message: "received" })

    if (entryIsInDB) {
        res.status(400).json({ code: 400, message: "user already part of community" })
    }
    else {
        client.query(
            "INSERT INTO community_users (community_id, user_id) VALUES ($1,$2)", [req.params.community_id, req.params.user_id],
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

const removeUserFromCommunity = async (req, res) => {


    if (!tableContainsLink("community_users", req.params.community_id, req.params.user_id, community_trips_cache)) {
        res.status(404).json({ code: 404, message: "user not part of community" })
    }

    client.query(
        "DELETE FROM community_users WHERE community_id = $1 AND user_id = $2",
        [req.params.community_id, req.params.user_id],
        function(error, results) {
            if (!error) {
                removeElementFromSet(community_users_cache, String(req.params.community_id) + "-" + String(req.params.user_id))
                res.status(204).json({
                    code: 204,
                    message: "user removed from the community successfully"
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









module.exports = { community_users_cache, addUserToCommunity, removeUserFromCommunity, getAllUsersOfCommunity, createCommunity, getAllCommunities, getCommunityById, deleteCommunity, updateCommunity, getAllTripsOfCommunity, removeTripFromCommunity, addTripToCommunity }
