const {client} = require("../config/configDB");

//create trips table
const createTrip = async () => {
    try {
        const query = `
    CREATE TABLE IF NOT EXISTS trips (
      trip_id SERIAL PRIMARY KEY,
      trip_name VARCHAR(50) NOT NULL,
      trip_origin VARCHAR(50) NOT NULL,
      trip_destination VARCHAR(50) NOT NULL,
      trip_desc VARCHAR(300) NOT NULL,
      trip_departure_datetime TIMESTAMP NOT NULL,
      trip_arrival_datetime TIMESTAMP NOT NULL
    );
    `;
        await client.query(query);
    } catch (error) {
        console.error('Error creating table:', error);
    }
}

//create table which links trip to community
const createCommunityTripTable = async () => {
    try {
        const query = `
    CREATE TABLE IF NOT EXISTS community_trip (
      community_trip_id SERIAL PRIMARY KEY,
      community_id INT,
      trip_id INT,
      FOREIGN KEY (community_id) REFERENCES communities(community_id),
      FOREIGN KEY (trip_id) REFERENCES trips(trip_id)
  );
  `;
        await client.query(query);
    } catch (error) {
        console.error('Error creating table:', error);
    }
}

//create table which user with community
const createUserCommunityTable = async () => {
    try {
        const query = `
    CREATE TABLE IF NOT EXISTS user_community (
      user_community_id SERIAL PRIMARY KEY,
      user_id INT,
      community_id INT,
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (community_id) REFERENCES communities(community_id)
  );
  `;
        await client.query(query);
    } catch (error) {
        console.error('Error creating table:', error);
    }
}

//create table which link user with trip
const createUserTripTable = async () => {
    try {
        const query = `
    CREATE TABLE IF NOT EXISTS user_trip (
      user_trip_id SERIAL PRIMARY KEY,
      user_id INT,
      trip_id INT,
      is_admin BOOLEAN,
      FOREIGN KEY (trip_id) REFERENCES trips(trip_id),
      FOREIGN KEY (user_id) REFERENCES users(user_id)
  );
  `;
        await client.query(query);
    } catch (error) {
        console.error('Error creating table:', error);
    }
}

//trip join request table
const createTripJoinRequestTable = async () => {
    try {
        const query = `
    CREATE TABLE IF NOT EXISTS join_requests (
      join_request_id SERIAL PRIMARY KEY,
      user_id INT,
      trip_id INT,
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (trip_id) REFERENCES trips(trip_id)
    );
    `
        await client.query(query);
    } catch (error) {
        console.log("error creating table:", error);
    }
}

module.exports = {
    createTrip, createCommunityTripTable, createUserCommunityTable, createUserTripTable, createTripJoinRequestTable
};
