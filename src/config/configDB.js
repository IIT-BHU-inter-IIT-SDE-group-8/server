const {Client} = require("pg")
const path = require("path")
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const client = new Client({
  host: process.env.HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
})

client.connect()
  .then(() => {
    console.log('Connected to the database');
  })
  .catch(error => {
    console.error('Error connecting to the database:', error);
  });

module.exports = {client}