const postgres = require("node-postgres");
const { Client } = require('pg');
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

// Підключення до бази даних
const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

// Підключення до PostgreSQL
client
    .connect()
    .then(() => {
        console.log('Connected to PostgreSQL database');

        // Execute SQL queries here

        client.query('SELECT * FROM schedule', (err, result) => {
            if (err) {
                console.error('Error executing query', err);
            } else {
                //console.log('Query result:', result.rows);
            }

            // Close the connection when done
            /*client
                .end()
                .then(() => {
                    console.log('Connection to PostgreSQL closed');
                })
                .catch((err) => {
                    console.error('Error closing connection', err);
                });*/
        });
    })
    .catch((err) => {
        console.error('Error connecting to PostgreSQL database', err);
    });
    
module.exports = client;