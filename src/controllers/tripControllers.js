const { pool } = require('../models/configDB')

const createTrip = async (req, res) => {
    let community_id = req.params.community_id;

    const { name, origin, destination, desc, departure_dateTime, arrival_dateTime } = req.body

    pool.query(`
        INSERT INTO trips (trip_name, trip_origin, trip_destination, trip_desc, trip_departure_datetime, trip_arrival_datetime, community_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [name, origin, destination, desc, departure_dateTime, arrival_dateTime, community_id],
        (err, results) => {
            if (err) {
                throw err;
            }
            req.flash("success msg", "Trip created successfully")
        }
    )

    const message = "Trip created successfully";
    res.json({ message });
}

const queryTrips = async (req, res) => {
    // Collect unique dates, origins, and destinations
    const uniqueDates = new Set();
    const uniqueOrigins = new Set();
    const uniqueDestinations = new Set();
    const community_id = req.params.community_id;

    pool.query(`SELECT * FROM trips`, (err, results) => {
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
        const destination = req.query.destination ? [req.query.destination] : [...uniqueDestinations]; // Convert Set to Array
        const timeRangeStartTime = req.query.timeRangeStartTime || '00:00:00';
        const timeRangeEndTime = req.query.timeRangeEndTime || '23:59:59';

        // Construct and execute the SQL query based on parameters
        pool.query(
            `SELECT * FROM trips
             WHERE (community_id = $6
             AND (trip_departure_datetime::date = ANY($1::date[]) OR trip_arrival_datetime::date = ANY($1::date[]))
             AND trip_origin = ANY($2::text[])
             AND trip_destination = ANY($3::text[])
             AND (trip_departure_datetime::time >= $4 OR trip_arrival_datetime::time >= $4) 
             AND (trip_departure_datetime::time <= $5 OR trip_arrival_datetime::time <= $5))`,
            [queryDate, origin, destination, timeRangeStartTime, timeRangeEndTime, community_id],
            (err, results) => {
                if (err) {
                    throw err;
                }

                res.json({ results: results.rows });
            }
        );
    });
};



module.exports = { createTrip, queryTrips }