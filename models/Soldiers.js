const { Pool } = require('pg');  // Використовуємо Pool для керування підключеннями
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    max: 20, // Максимальна кількість підключень у пулі (за бажанням)
    idleTimeoutMillis: 30000, // Час очікування бездіяльності перед закриттям підключення
    connectionTimeoutMillis: 2000, // Час на спробу підключення
});

async function fetchSoldiers() {
    const client = await pool.connect();  // Отримуємо клієнта з пулу
    console.log('Connected to the database');
    try {
        const result = await client.query('SELECT * FROM soldiers');
        return result.rows.map(soldier => ({
            ...soldier,
            holidays: soldier.holidays || [], // Ініціалізація
            sickLeaves: soldier.sick_leaves || [],
            unitDuties: 0,
            outsideDuties: 0,
            lastDuty: null,
            weekendWeeks: []
        }));
    } catch (err) {
        console.error('Error fetching soldiers:', err);
        throw err;
    } finally {
        client.release();  // Завжди звільняємо клієнта після завершення роботи
    }
}



module.exports = {
    fetchSoldiers,
    pool
};
