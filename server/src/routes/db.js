const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { getDbHandler } = require('../controllers/dbController');

const router = express.Router();
router.get('/db', asyncHandler(getDbHandler));
module.exports = router;
