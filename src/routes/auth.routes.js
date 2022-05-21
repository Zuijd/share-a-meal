const express = require('express');
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');
const router = express.Router();

//login
router.post('/api/auth/login',
    userController.checkMail,
    userController.validateEmail,
    userController.validatePassword,
    authController.login
);

module.exports = router;