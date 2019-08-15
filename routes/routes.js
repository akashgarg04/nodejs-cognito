var express = require('express');
var router = express.Router();
var authController = require('../controller/AuthController');

//router.post('/', (req, res) => res.send('Hello Wfrom nodejs authentication server'));
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/validate', authController.validate_token);


module.exports = router;