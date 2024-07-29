var express = require('express');
const { register, signIn, pinValidation } = require('../controllers/auth');
const { isLoginUser } = require('../../middleware/auth');
var router = express.Router();

router.post('/register', register);
router.post('/signin', signIn);
router.post('/pin/validate', isLoginUser, pinValidation);

module.exports = router;
