const {client} = require("../config/configDB");
const tableContainsLink = require("../utils/tabelContainsLink")

const deleteFriendship = async (req, res) => {
    const callerId = req.user.id;
    const user1_id = req.body.user1_id;
    const user2_id = req.body.user2_id;
    if (callerId !== user1_id && callerId !== user2_id) {
        return res.status(404).json({status: 404, message: "User is not allowed to perform this operation"})
    }
    client.query(
        "DELETE FROM friendship WHERE user1_id = $1 OR user2_id = $2 RETURNING *",
        [user1_id, user2_id],
        function(error, results) {
            if (!error && results.rows.length !==0) {
                res.status(200).json({
                    "success": true,
                    "data_deleted": results.rows
            });
            } else {
                res.status(400).json({
                    code: 400,
                    message: "friendship not found",
                });
            }
        }
    );
};


const getAllFriendsOfUser = async (req, res) => {

    client.query(`
    SELECT u2.user_id, u2.user_name, u2.user_bio
    FROM friendship f
    JOIN users u1 ON (
        CASE
            WHEN f.user1_id = $1 THEN f.user1_id
            ELSE f.user2_id
        END
    ) = u1.user_id
    JOIN users u2 ON (
        CASE
            WHEN f.user1_id = $1 THEN f.user2_id
            ELSE f.user1_id
        END
    ) = u2.user_id
    WHERE u1.user_id = $1;
`
        , [req.params.user_id],

        function(error, results) {
            if (!error && results.rows.length != 0) {
                res.status(201).send(results.rows);
            } else if (results.rows.length == 0) {
                res.status(400).json({
                    code: 400,
                    message: "no friends exist",
                });
            } else {
                console.log(error);
                res.status(500).json({
                    code: 500,
                    message: "Internal server error",
                });

            }
        }
    )
}


module.exports = { deleteFriendship, getAllFriendsOfUser }
