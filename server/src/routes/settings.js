const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { getSettingsHandler, updateSettingsHandler } = require('../controllers/settingsController');

const router = express.Router();
router.get('/settings', asyncHandler(getSettingsHandler));
router.put('/settings', asyncHandler(updateSettingsHandler));
module.exports = router;
