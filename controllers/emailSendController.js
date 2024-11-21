const sendEmail = require('../services/sendEmail');
const {client} = require('../models/Soldiers');
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

async function sendLetter({ name, state, relatives_email }) {
    //const { name, old_status, new_status, recipientEmail} = req.body;
    try {
        await sendEmail({
            to: relatives_email,
            from: process.env.USER_EMAIL,
            subject: `Зміна стану військовослужбовця: ${name}`,
            text: `Стан військовослужбовця ${name} змінився на "${state}".`
        });
        //res.sendStatus(200);
    } catch (e) {
        console.error('Error sending email:', e);
    }
}

client.on('notification', async (msg) => {
    const payload = JSON.parse(msg.payload);
    console.log('State change detected:', payload);

    // Надсилаємо листа
    await sendLetter(payload);
});

// Підписка на канал
client.query('LISTEN state_changes');

console.log('Listening for state changes...');
