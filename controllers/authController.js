const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
//const jwt = require('jsonwebtoken');
const User = require('../models/Soldiers');
//const sendEmail = require('../Services/SendEmail');

// const crypto = require('crypto');
// const jwtSecretKey = crypto.randomBytes(64).toString('hex');
// console.log(jwtSecretKey);

class AuthController {
    async register(req, res) {
        const { name, email, password, surname } = req.body; 
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHashed = await bcrypt.hash(password, salt);

        User.create({ name: `${name}`, surname: `${surname}`, email: `${email}`, password: `${passwordHashed}`});

        const curUser = await User.findOne({ email: email });
        console.log(curUser._id)

        // const url = `http://${process.env.HOST}:${process.env.PORT}/users/${curUser.id}/verify`;
        // await sendEmail(process.env.USER_EMAIL, email, "Verify your Email", url);
        // res.status(201).send({ message: "An email has been sent to your account. Please verify." });
    }

    async login(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        const user = await User.findOne({ email: email.trim() });

        try {
            console.log(email)
            if (!user) {
                return res.status(404).send('User not found');
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).send('Invalid credentials');
            }

            req.session.userId = user.id;
            res.send(`Logged in successfully as ${user.name}`);

        } catch (error) {
            res.status(500).send('Login error: ' + error.message);
        }

    };

    // async forgotPassword(req, res) {
    //     try {
    //         const user = await User.findOne({ email: req.body.email });
    //         if (!user) {
    //             return res.status(404).send({ message: "User not found" });
    //         }

    //         // Generate a unique JWT token for the user that contains the user's id
    //         const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "10m", });

    //         const text = `Click on the following link to reset your password: http://localhost:3000/reset-password/${token} \
    //                If you didn't request a password reset, please ignore this email.`;
    //         await sendEmail(process.env.USER_EMAIL, user.email, "Reset Password", text);
    //         res.status(201).send({ message: "An email has been sent to your account. Please check." });
    //     } catch (err) {
    //         res.status(500).send({ message: err.message });
    //     }
    // };

    // async resetPassword(req, res) {
    //     try {
    //         // Verify the token sent by the user
    //         const decodedToken = jwt.verify(
    //             req.params.token,
    //             process.env.JWT_SECRET_KEY
    //         );

    //         // If the token is invalid, return an error
    //         if (!decodedToken) {
    //             return res.status(401).send({ message: "Invalid token" });
    //         }

    //         // find the user with the id from the token
    //         const user = await User.findOne({ _id: decodedToken.userId });
    //         if (!user) {
    //             return res.status(401).send({ message: "no user found" });
    //         }

    //         // Hash the new password
    //         const salt = await bcrypt.genSalt(10);
    //         req.body.newPassword = await bcrypt.hash(req.body.newPassword, salt);

    //         // Update user's password, clear reset token and expiration time
    //         user.password = req.body.newPassword;
    //         await user.save();

    //         // Send success response
    //         res.status(200).send({ message: "Password updated" });
    //     } catch (err) {
    //         // Send error response if any error occurs
    //         res.status(500).send({ message: err.message });
    //     }
    // };

    logout(req, res) {
        if(req.session.userId){
            delete req.session.userId;
            
            res.status(200).send({ message: "You have successfully exited" });

        }
        else {
            res.status(200).send({ message: "You are not authorized anyway" });
        }
    }
}

module.exports = new AuthController();
