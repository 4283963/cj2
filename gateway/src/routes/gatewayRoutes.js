const express = require('express');
const router = express.Router();
const gatewayController = require('../controllers/gatewayController');

router.post('/receive', gatewayController.receiveData);

module.exports = router;
