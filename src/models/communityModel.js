
const {client} = require("../config/configDB");



const createCommunitiesTable = () => {

    client.query(`
            CREATE TABLE IF NOT EXISTS communities (
                community_id SERIAL PRIMARY KEY,
                community_name VARCHAR(255) NOT NULL,
                community_desc VARCHAR(255)
            );
            `, (err, res) => {
        if (err) {
            console.error('Error creating communities table:', err);
        } else {
            console.log('Communities table created successfully');
        }
    });


}


const createCommunitiesTripsTable = () => {
    client.query(`
        CREATE TABLE IF NOT EXISTS community_trips (
            community_trips_id SERIAL PRIMARY KEY,
            community_id INT NOT NULL,
            trip_id INT NOT NULL,
            FOREIGN KEY (community_id) REFERENCES communities(community_id),
            FOREIGN KEY (trip_id) REFERENCES trips(trip_id)
        );
        `, (err, res) => {
        if (err) {
            console.error('Error creating community_trips table:', err);
        } else {
            console.log('Community_trips table created successfully');
        }
    });
}

module.exports = { createCommunitiesTripsTable, createCommunitiesTable }
