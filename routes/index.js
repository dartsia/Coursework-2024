var express = require('express');
var router = express.Router();
const mainController = require('../controllers/mainController');
const emailController = require('../controllers/emailSendController');

router.get('/', mainController.scheduleTable);
router.get('/:id', mainController.scheduleOne);
router.post('/generate-schedule', mainController.generateSchedule);

//router.post('/status-change', emailController.sendEmail);

module.exports = router;
