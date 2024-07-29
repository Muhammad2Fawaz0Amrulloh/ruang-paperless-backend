const express = require('express');
const router = express.Router();
const { isLoginUser } = require("../../middleware/auth");
const { getProfile } = require('../controllers/user');

router.get('/profile', isLoginUser, getProfile);

module.exports = router;
