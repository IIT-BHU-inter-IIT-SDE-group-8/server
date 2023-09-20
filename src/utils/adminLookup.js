const { client } = require("../config/configDB.js")
const community_admin_cache = new Map()

function adminLookup(community_id) {
    const cachedAdminValue = community_admin_cache.get(community_id)
    if (cachedAdminValue != undefined) {
        return cachedAdminValue;
    }
    else {
        client.query("SELECT admin_id FROM communities WHERE community_id =$1", [community_id],
            (err, results) => {
                if (!err) {
                    community_admin_cache.set(community_id, results.rows[0].admin_id)
                    return results.rows[0].admin_id
                }
                else {
                    return null
                }
            }
        )
    }
}
module.exports = { adminLookup }
