const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { loginHandler } = require('../controllers/authController');

const router = express.Router();
router.post('/auth/login', asyncHandler(loginHandler));
module.exports = router;
