const {client} = require('../config/configDB');
const {findAdmin} = require('../controllers/tripController');
const tripAdminQuery = `SELECT user_id FROM trip_admin WHERE trip_id = $1`;
const trip_admin_cache = new Map();

const getAllTripJoinRequests = async (req, res, next) => {

    const trip_id = parseInt(req.params.trip_id, 10);
    const user_id = parseInt(req.params.user_id, 10);
    const auth_user_id = req.user.id;

    try {
        const tripAdmin = findAdmin(tripAdminQuery, trip_id);
        if (user_id === auth_user_id && user_id === tripAdmin) {
            client.query(`

            SELECT user_id FROM trip_join_requests WHERE trip_id = $1;
    
            `, [trip_id], (err, results) => {
                if (err) {
                    throw err;
                }
                res.status(200).json({ results: results.rows })
            })
        } else {
            res.status(401).json({ results: "cannot get join requests" })
        }
    } catch (error) {
        next(error);
    }
}

module.exports = {getAllTripJoinRequests}