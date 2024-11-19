const sendgrid = require ('@sendgrid/mail');


sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

 const sendEmail = ({ to, from, subject, text, html }) => {
    const msg = { to, from, subject, text };
    return sendgrid.send(msg);
};

module.exports = sendEmail;

/*const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const nodemailer = require("nodemailer");

module.exports = async (sender, receiver, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST_EMAIL,
            service: process.env.SERVICE_EMAIL,
            port: Number(process.env.EMAIL_PORT),
            secure: Boolean(process.env.SECURE),
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.PASS_EMAIL
            }
        });

        await transporter.sendMail({
            from: sender,
            to: receiver,
            subject: subject,
            text: text
        });
        console.log("Email sent sucessfully.");
    } catch (error) {
        console.log("Email NOT sent." + error);
    }
}*/