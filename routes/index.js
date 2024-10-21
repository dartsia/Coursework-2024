var express = require('express');
var router = express.Router();
const mainController = require('../controllers/mainController');
const authController = require('../controllers/authController');

/* GET home page. */
router.get('/', mainController.schedule);


router.post(
    '/registry',
     (req, res) => {
    const errors = signUpValidation(req);
    if (errors.length > 0) {
      return res.status(400).json({ errors: errors });
    } else {
      authController.register(req, res);
    }
});
  
router.post(
    '/login', 
    [
      body('email').isEmail().withMessage('Email must be valid'),
      body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    ],
    authController.login
);

// router.post('/forgot-password', authController.forgotPassword);

// router.post('/reset-password/:token',  (req, res) => {
//   const errors = resetPasswdValidation(req);
//   if (errors.length > 0) {
//     return res.status(400).json({ errors: errors });
//   } else {
//     authController.resetPassword(req, res);
//   }
// });

router.get('/logout', authController.logout);

module.exports = router;
