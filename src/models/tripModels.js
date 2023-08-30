const {client}  = require("../config/configDB");

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
    console.error('Error creating table:',error);
  }
}
  
//create table which links trip to community
const trip_link_to_community = async () => {
  try {
    const query = `
    CREATE TABLE IF NOT EXISTS community_trip (
      community_trip_id SERIAL PRIMARY KEY,
      community_id INT,
      trip_id INT
  );  
  `;
  await client.query(query);
  // console.log('Table "users" created successfully');
  } catch (error) {
    console.error('Error creating table:',error);
  }
}
  
//create table which user with community
const link_user_to_community = async () => {
  try {
    const query = `
    CREATE TABLE IF NOT EXISTS user_community (
      user_community_id SERIAL PRIMARY KEY,
      user_id INT,
      community_id INT
  );   
  `;
  await client.query(query);
  // console.log('Table "users" created successfully');
  } catch (error) {
    console.error('Error creating table:',error);
  }
}

//create table which link user with trip
const link_user_to_trip = async () => {
  try {
    const query = `
    CREATE TABLE IF NOT EXISTS user_trip (
      user_trip_id SERIAL PRIMARY KEY,
      user_id INT,
      trip_id INT
  );    
  `;
  await client.query(query);
  // console.log('Table "users" created successfully');
  } catch (error) {
    console.error('Error creating table:',error);
  }
}
  
module.exports = {
    createTrip, trip_link_to_community, link_user_to_community, link_user_to_trip
};