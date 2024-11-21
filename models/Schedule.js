const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Створення пулу підключень
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    max: 10, // Максимальна кількість підключень у пулі
    idleTimeoutMillis: 30000, // Час очікування простою підключення перед його закриттям
    connectionTimeoutMillis: 2000, // Час очікування відповіді від сервера
});

// Логування успішного підключення
pool
    .connect()
    .then((client) => {
        console.log('Connected to PostgreSQL database');
        client.release(); // Звільнення клієнта після перевірки
    })
    .catch((err) => {
        console.error('Error connecting to PostgreSQL database:', err);
    });

module.exports = pool;
