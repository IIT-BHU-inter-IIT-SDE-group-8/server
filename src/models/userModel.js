const {client}  = require("../config/configDB");

// Create the users table
const createUsersTable = async () => {
  try {
    const query = `
    CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        user_name VARCHAR(255) NOT NULL,
        user_email VARCHAR(255) NOT NULL UNIQUE,
        user_password VARCHAR(255) NOT NULL,
        user_bio TEXT,
        user_mobile VARCHAR(20)
    );
    `;

    await client.query(query);
  } catch (error) {
    console.error('Error creating table:', error);
  }
};

module.exports = {
  createUsersTable
};