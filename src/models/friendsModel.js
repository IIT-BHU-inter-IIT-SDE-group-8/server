const {client}  = require("../config/configDB");

//friendship table
const link_user_to_user = async () => {
    try {
      const query = `
      CREATE TABLE IF NOT EXISTS friendship (
        friendship_id SERIAL PRIMARY KEY,
        user1_id INT,
        user2_id INT
    );     
    `;
    await client.query(query);
    } 
    catch (error) {
      console.error('Error creating table:',error);
    }
  }

module.exports = {link_user_to_user}