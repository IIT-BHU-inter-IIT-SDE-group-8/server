const { client } = require('../config/configDB')
const tripAdminQuery = `SELECT user_id FROM trip_admin WHERE trip_id = $1`;
const trip_users_cache = new Set();

const createTrip = async (req, res, next) => {
    const { name, origin, destination, desc, departure_dateTime, arrival_dateTime } = req.body
    try {
        client.query(`
        INSERT INTO trips (trip_name, trip_origin, trip_destination, trip_desc, trip_departure_datetime, trip_arrival_datetime)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING trip_id`,
            [name, origin, destination, desc, departure_dateTime, arrival_dateTime],
            (err, results) => {
                if (err) {
                    throw err;
                }
            })
        const message = "Trip created successfully";
        res.status(200).json({ message });
    } catch (error) {
        next(error);
    }
}

function findAdmin(AdminQuery, group_id) {
  return new Promise((resolve, reject) => {
    client.query(AdminQuery, [group_id], (err, results) => {
      if (err) {
        reject(err); 
      } else {
        if (results.rows.length > 0) {
          resolve(results.rows[0].user_id);
        } else {
          resolve(null);
        }
      }
    });
  });
}


const UpdateTrip = async (req, res, next) => {
    const auth_user_id = req.user.id;
    const { name, origin, destination, desc, departure_dateTime, arrival_dateTime } = req.body
    const trip_id = parseInt(req.params.trip_id, 10);

    try {

        findAdmin(tripAdminQuery, trip_id).then(AdminId => {

            if (AdminId === auth_user_id) {
                client.query(`

            UPDATE trips SET trip_name = $2, trip_origin = $3, trip_destination = $4,trip_desc = $5, trip_departure_datetime = $6, trip_arrival_datetime = $7
            WHERE trip_id = $1
            `, [trip_id, name, origin, destination, desc, departure_dateTime, arrival_dateTime], (err, results) => {
                        if (err) {
                            throw err;
                        }
                    })
                    res.status(200).json({ message: "trip updated successfully!" });
                } else {
                    res.status(401).json({ message: "Failed to update trip." });
                }
            })

    } catch (error) {
        next(error);
    }
}

const deleteTrip = async (req, res, next) => {
    const trip_id = parseInt(req.params.trip_id, 10);
    const auth_user_id = req.user.id;

    try {
        findAdmin(tripAdminQuery, trip_id).then(AdminId => {
        
            if (AdminId === auth_user_id) {
                client.query(`DELETE FROM trips
                WHERE trip_id = $1`, [trip_id], (err, results) => {
                    if (err) {
                        throw err;
                    }
                })
                res.status(200).json({ message: "Trip deleted successfully." })
            } else {
                res.status(401).json({ message: "Failed to delete the trip." })
            }
        })
    } catch (error) {
        next(error);
    }
}

const idQuery = `
    WITH UserFriends AS (
        SELECT DISTINCT user2_id AS friend_id
        FROM friendship
        WHERE user1_id = $1
        UNION
        SELECT DISTINCT user1_id AS friend_id
        FROM friendship
        WHERE user2_id = $1
    )

    SELECT DISTINCT UT.trip_id
    FROM user_trip UT
    WHERE UT.user_id = $1
        OR UT.user_id IN (
            SELECT UC.user_id
            FROM user_community UC
            WHERE UC.community_id IN (
                SELECT UC2.community_id
                FROM user_community UC2
                WHERE UC2.user_id = $1
            )
        )
        OR UT.user_id IN (
            SELECT friend_id
            FROM UserFriends
        )
    UNION
    SELECT DISTINCT CT.trip_id
    FROM community_trip CT
    WHERE CT.community_id IN (
        SELECT UC.community_id
        FROM user_community UC
        WHERE UC.user_id = $1
    );
`;

const trip_Ids = new Set();

function fetchGroupIds(user_id, Query, group_Ids) {
    return new Promise((resolve, reject) => {
        client.query(Query, [user_id], (err, results) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {

                results.rows.forEach(ele => {
                    group_Ids.add(ele.trip_id);
                });

                resolve(group_Ids);
            }
        });
    });
}

const getAllTripsOfUserFriendsAndCommunity = async (req, res, next) => {

    const user_id = parseInt(req.params.user_id, 10);
    const auth_user_id = req.user.id;

    try {

        if (user_id == auth_user_id) {

            fetchGroupIds(user_id, idQuery, trip_Ids).then(tripIds => {
                queryTrips(req, res, tripIds);
            })

        } else {
            res.status(401).json({ message: "cannot get the trips!!" })
        }

    } catch (error) {
        next(error);
    }
}

const queryTrips = async (req, res, tripIds) => {
    const uniqueDates = new Set();
    const uniqueOrigins = new Set();
    const uniqueDestinations = new Set();
    const tripIdsArray = Array.from(tripIds);
    try {
        client.query(`SELECT * FROM trips WHERE trip_id = ANY($1)`, [tripIdsArray], (err, results) => {

            if (err) {
                throw err;
            }

            results.rows.forEach(row => {
                uniqueDates.add(row.trip_arrival_datetime.toDateString());
                uniqueDates.add(row.trip_departure_datetime.toDateString());
                uniqueOrigins.add(row.trip_origin);
                uniqueDestinations.add(row.trip_destination);
            });

            const queryDate = req.query.date ? [req.query.date] : [...uniqueDates]; // Convert Set to Array
            const origin = req.query.origin ? [req.query.origin] : [...uniqueOrigins]; // Convert Set to Array
            const allTripsAccessibleToUser = [...tripIds];
            const destination = req.query.destination ? [req.query.destination] : [...uniqueDestinations]; // Convert Set to Array
            const timeRangeStartTime = req.query.timeRangeStartTime || '00:00:00';
            const timeRangeEndTime = req.query.timeRangeEndTime || '23:59:59';

            // Construct and execute the SQL query based on parameters
            client.query(
                `SELECT * FROM trips
                 WHERE (trip_id = ANY($6::int[])
                 AND (trip_departure_datetime::date = ANY($1::date[]) OR trip_arrival_datetime::date = ANY($1::date[]))
                 AND trip_origin = ANY($2::text[])
                 AND trip_destination = ANY($3::text[])
                 AND (trip_departure_datetime::time >= $4 OR trip_arrival_datetime::time >= $4)
                 AND (trip_departure_datetime::time <= $5 OR trip_arrival_datetime::time <= $5))`,
                [queryDate, origin, destination, timeRangeStartTime, timeRangeEndTime, allTripsAccessibleToUser],
                (err, results) => {
                    if (err) {
                        throw err;
                    }
                    res.status(200).json({ results: results.rows });
                }
            );
        });
    } catch (error) {
        console.log("error");
    }
}

const getTripById = async (req, res, next) => {

    const trip_id = parseInt(req.params.trip_id, 10);
    const user_id = req.user.id;

    try {
        fetchGroupIds(user_id, idQuery, trip_Ids).then(tripIds => {
            const userTripIds = Array.from(tripIds);

            if (userTripIds.includes(trip_id)) {
                client.query("SELECT * FROM trips WHERE trip_id = $1", [trip_id],
                    (error, result) => {

                        if (!error) {
                            res.status(200).json(result.rows);
                        }
                        else {
                            res.status(500).json({
                                status: 500,
                                message: "Unknown internal error occurred while getting trip by id"
                            })
                        }
                    })
            } else {
                res.status(401).json({ message: "Cannot get the trip!!" })
            }
        })
    } catch (error) {
        next(error);
    }
}

const getAllTrips = async (req, res, next) => {
    try {
        client.query(`SELECT * from trips`, (err, results) => {
            if (err) {
                return next(err);
            }

            // Send the results as a JSON response
            res.status(200).json({ result: results.rows });
        });
    } catch (error) {
        next(error);
    }
}

const AllowOrDenyTripJoinRequest = async (req, res, next) => {
    try {

        const allow = req.body.allow;
        const userId = parseInt(req.body.user_id, 10);
        const auth_user_id = req.user.id;
        const admin_idFrom_Url = parseInt(req.params.user_id);
        const tripId = parseInt(req.params.trip_id, 10);
        const AdminId = findAdmin(tripAdminQuery, tripId)

        if (AdminId === auth_user_id && admin_idFrom_Url === auth_user_id) {
            if (allow == true) {
                client.query(
                    `INSERT INTO user_trip(user_id INT, trip_id, is_admin)
                    VALUES($1, $2, $3)`,
                    [userId, tripId, false]
                );
            }

            client.query(`
            DELETE FROM join_requests
            WHERE user_id = $1;
            `, [userId]);
        }
        else {
            res.status(401).json({ message: "cannot perform the query!!" })
        }
    } catch (error) {
        next(error);
    }
}

module.exports = { getTripById, createTrip, UpdateTrip, deleteTrip, getAllTrips, getAllTripsOfUserFriendsAndCommunity, queryTrips, AllowOrDenyTripJoinRequest, findAdmin, fetchGroupIds, tripAdminQuery, trip_users_cache }
