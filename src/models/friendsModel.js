const {client} = require("../config/configDB");

//friendship table
const createFriendsTable = async () => {
    try {
        const query = `
      CREATE TABLE IF NOT EXISTS friendship (
        friendship_id SERIAL PRIMARY KEY,
        user1_id INT,
        user2_id INT,
        FOREIGN KEY (user1_id) REFERENCES users(user_id),
        FOREIGN KEY (user2_id) REFERENCES users(user_id)
    );
    `;
        await client.query(query);
    }
    catch (error) {
        console.error('Error creating table:', error);
    }
}

//create friend request table
const createFriendRequestTable = async () => {
    try {
        client.query(`CREATE TABLE IF NOT EXISTS friend_request (
            friend_request_id SERIAL PRIMARY KEY,
            user1_id INT,
            user2_id INT,
            FOREIGN KEY (user1_id) REFERENCES users(user_id),
            FOREIGN KEY (user2_id) REFERENCES users(user_id)
        );`)
    } catch (error) {
        console.log("error creating table:",error);
    }
}

module.exports = { createFriendsTable, createFriendRequestTable }
