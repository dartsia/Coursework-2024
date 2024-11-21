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

let soldiers;

// Підключення до PostgreSQL
client
    .connect()
    .then(() => {
        //console.log('Connected to PostgreSQL database');

        client.query('SELECT * FROM soldiers', (err, result) => {
            if (err) {
                console.error('Error executing query', err);
            } else {
                soldiers = result.rows;
                //console.log(soldiers);
            }
        });
    })
    .catch((err) => {
        console.error('Error connecting to PostgreSQL database', err);
    });
    
module.exports = {
    soldiers,
    client
};
//console.log(module.exports);

// module.exports = [
//     { name: 'Soldier1', gender: 'male', holidays: ['2024-01-01', '2024-01-07'], sickLeaves: [], unitDuties: 0, outsideDuties: 0 },
//     { name: 'Soldier2', gender: 'female', holidays: ['2024-01-05', '2024-01-12'], sickLeaves: [], unitDuties: 0, outsideDuties: 0 },
//     { name: 'Soldier3', gender: 'male', holidays: ['2024-01-10', '2024-01-15'], sickLeaves: [], unitDuties: 0, outsideDuties: 0 },
//     { name: 'Soldier4', gender: 'female', holidays: ['2024-01-10', '2024-01-15'], sickLeaves: [], unitDuties: 0, outsideDuties: 0 },
//     { name: 'Soldier5', gender: 'male', holidays: ['2024-01-10', '2024-01-15'], sickLeaves: [], unitDuties: 0, outsideDuties: 0 },
//     { name: 'Soldier6', gender: 'male', holidays: ['2024-01-25', '2024-01-30'], sickLeaves: ['2024-12-02'], unitDuties: 0, outsideDuties: 0 },
//     { name: 'Soldier7', gender: 'male', holidays: ['2024-02-10', '2024-02-15'], sickLeaves: [], unitDuties: 0, outsideDuties: 0 },
//     { name: 'Soldier8', gender: 'male', holidays: ['2024-02-20', '2024-02-25'], sickLeaves: [], unitDuties: 0, outsideDuties: 0 },
//     { name: 'Soldier9', gender: 'male', holidays: ['2024-03-15', '2024-03-20'], sickLeaves: [], unitDuties: 0, outsideDuties: 0 },
//     { name: 'Soldier10', gender: 'male', holidays: ['2024-05-10', '2024-05-15'], sickLeaves: [], unitDuties: 0, outsideDuties: 0 },
//         // Add more soldiers here
// ];