require("dotenv").config();

const {Pool} = require('pg');

const pool = new Pool({
    
    "user": process.env.DB_USER,
    "host": process.env.DB_HOST,
    "database": process.env.DB_DATABASE,
    "password": process.env.DB_PASSWORD,
    "port": process.env.DB_PORT
    
})

pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        user_name VARCHAR(255) NOT NULL,
        user_email VARCHAR(255) NOT NULL UNIQUE,
        user_password VARCHAR(255) NOT NULL,
        user_bio TEXT,
        user_mobile VARCHAR(20)
    );
`);

pool.query(`
    CREATE TABLE IF NOT EXISTS trips (
        trip_id SERIAL PRIMARY KEY,
        trip_name VARCHAR(50) NOT NULL,
        trip_origin VARCHAR(50) NOT NULL,
        trip_destination VARCHAR(50) NOT NULL,
        trip_desc VARCHAR(300) NOT NULL,
        trip_departure_datetime TIMESTAMP NOT NULL,
        trip_arrival_datetime TIMESTAMP NOT NULL,
        community_id integer NOT NULL
    );
`)


module.exports = {pool}