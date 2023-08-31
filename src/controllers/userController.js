const client = require('../config/configDB.js');


export function linkUserToSubscriptionObject(req, res) {

    client.query("INSERT INTO user_subsriptions VALUES = ($1, $2)",
        [req.param.user_id, req.param.subscription_id], (errors, result, fields) => {

            if (!errors) {
                res.status(201).send(result)
            } else {
                res.status(500).json({
                    status: 500,
                    message: "unexpected error"
                })
            }
        })

}




