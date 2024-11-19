const sendEmail = require('../services/sendEmail');
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

module.exports.sendEmail = async function (req,res) {
    const { name, old_status, new_status, recipientEmail} = req.body;
    try {
        await sendEmail({
            //the client email 
            to: recipientEmail,
            //sendGrid sender id 
            from: process.env.USER_EMAIL,
            subject: 'Зміна стану військовослужбовця',
            text: `Стан військовослужбовця ${name} змінився з "${old_status}" на "${new_status}".`
        });
        res.sendStatus(200);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }

}
