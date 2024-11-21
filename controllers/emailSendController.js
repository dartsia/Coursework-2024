const sendEmail = require('../services/sendEmail');
const {pool} = require('../models/Soldiers');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function sendLetter({ name, state, relatives_email }) {
    try {
        await sendEmail({
            to: relatives_email,
            from: process.env.USER_EMAIL,
            subject: `Зміна стану військовослужбовця: ${name}`,
            text: `Стан військовослужбовця ${name} змінився на "${state}".`
        });
    } catch (e) {
        console.error('Error sending email:', e);
    }
}

async function listenToStateChanges() {
    const client = await pool.connect();
    console.log('Connected to database from listenToStateChanges');
    try {
        await client.query('LISTEN state_changes');
        console.log('Subscribed to channel');
        client.on('notification', async (msg) => {
            console.log('Notification received:', msg.payload);
        });
    } catch (error) {
        console.error('Error listening for state changes:', error);
    } finally {
        client.release(); // Завжди звільняємо клієнта
    }
}

// Викликаємо функцію для прослуховування змін
listenToStateChanges();
