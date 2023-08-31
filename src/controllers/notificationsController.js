const client = require('../config/configDB')
const subscription_cache = []
//TODO: these are dummy success and error messages to be swapped with the error handler and send true functions


export function saveSubscriptionObject(req, res) {

    if (subscriptionExists(req.endpoint)) {
        res.status(409).JSON({
            status: 409,
            message: "subscription already exists"
        })
    }
    else {
        client.query("INSERT INTO notifSubscriptions (endpoint, expiration_time, p256dh, auth) VALUES ($1, $2, $3, $4)",
            [req.endpoint, req.expiration_time, req.keys.p256, req.keys.auth], (errors, result, fields) => {

                if (!errors) {
                    return res.status(200)
                }
                else {
                    res.status(500).JSON({
                        status: 500,
                        message: "Internal server error"
                    })
                }
            })
    }
}

function subscriptionExists(endpoint) {

    let subscriptionExists = true;

    if (subscription_cache.has(endpoint)) {
        subscriptionExists = true;//just for code readability
    }
    else {
        client.query("SELECT * FROM notifSubscriptions WHERE endpoint = $1", [endpoint], (errors, result, fields) => {

            if (!errors && result.length() == 0) {
                subscriptionExists = false
                subscription_cache.push(endpoint)
            }
            else {
                console.log("error in fetching subscription from database")

                subscriptionExists = true;//just for code readability
            }

        })


    }
    return subscriptionExists;
}
