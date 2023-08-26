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


module.exports = {pool}