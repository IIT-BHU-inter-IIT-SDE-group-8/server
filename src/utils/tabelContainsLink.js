const client = require("../config/configDB")
const tableContainsLink = async (tableName, id1, id2, cacheName) => {


    console.log("inside util function")
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

module.exports = tableContainsLink
