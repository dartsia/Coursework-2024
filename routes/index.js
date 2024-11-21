var express = require('express');
var router = express.Router();
const mainController = require('../controllers/mainController');

router.get('/', mainController.scheduleTable);
router.get('/schedule-for-one', mainController.scheduleOne);
router.post('/generate-schedule', mainController.generateSchedule);

module.exports = router;
