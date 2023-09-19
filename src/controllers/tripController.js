const { client } = require('../config/configDB')

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

const updateTrip = async (req, res, next) => {
    const { name, origin, destination, desc, departure_dateTime, arrival_dateTime } = req.body
    const trip_id = req.params.trip_id;
    try {
        client.query(`

        UPDATE trips SET trip_name = $2, trip_origin = $3, trip_destination = $4,trip_desc = $5, trip_departure_datetime = $6, trip_arrival_datetime = $7
        WHERE trip_id = $1
        `, [trip_id, name, origin, destination, desc, departure_dateTime, arrival_dateTime], (err, results) => {
            if (err) {
                throw err;
            }
        })
        res.status(200).json({ message: "trip updated successfully!" });
    } catch (error) {
        next(error);
    }
}

const deleteTrip = async (req, res, next) => {
    const trip_id = req.params.trip_id;
    try {
        client.query(`DELETE FROM trips
        WHERE trip_id = $1`, [trip_id], (err, results) => {
            if (err) {
                throw err;
            }
        })
        res.json({ message: "Trip deleted successfully." })
    } catch (error) {
        next(error);
    }
}

const getAllTripsOfUserAndFriends = async (req, res, next) => {

    const user_id = req.param.user_id;

    try {

        client.query(`WITH UserFriends AS (
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
        `, [user_id], (err, results) => {
            if (err) {
                // Handle the error here
                console.error(err);
            } else {
                const tripIds = new Set();
                results.rows.map(ele => {
                    tripIds.add(ele.trip_id);
                });
                queryTrips(req, res, tripIds);
            }
        })

    } catch (error) {
        next(error);
    }
}

const getAllTrips = async (req, res, tripIds) => {
    const uniqueDates = new Set();
    const uniqueOrigins = new Set();
    const uniqueDestinations = new Set();
    try {
        client.query(`SELECT * FROM trips`, (err, results) => {

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

const getTripById = (req, res) => {

    client.query("SELECT * FROM trips WHERE trip_id = $1", [req.params.trip_id],
        (error, result) => {

            if (!error) {
                res.status(200).json(result)
            }
            else {
                res.status(500).json({
                    status: 500,
                    message: "Unknown internal error occurred while getting trip by id"
                })
            }

        })
}

const getAllTripJoinRequests = async (req, res, next) => {
    const trip_id = req.params.trip_id;
    const user_id = req.params.user_id;
    try {
        client.query(`
        SELECT jr.user_id
        FROM join_requests jr
        JOIN user_trip ut ON jr.trip_id = ut.trip_id
        WHERE jr.trip_id = $1
              AND ut.user_id = $2
              AND ut.is_admin = TRUE;

        `, [trip_id, user_id], (err, results) => {
            if (err) {
                throw err;
            }
            res.status(200).json({ results: results.rows })
        })
    } catch (error) {
        next(error);
    }
}

module.exports = { getTripById, createTrip,  updateTrip, deleteTrip, getAllTrips, getAllTripJoinRequests }
