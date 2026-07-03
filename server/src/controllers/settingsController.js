const { getSettings, updateSettings } = require('../services/settingsService');

async function getSettingsHandler(req, res) {
  const settings = await getSettings();
  res.json(settings);
}

async function updateSettingsHandler(req, res) {
  const result = await updateSettings(req.body);
  res.json(result);
}

module.exports = {
  getSettingsHandler,
  updateSettingsHandler
};