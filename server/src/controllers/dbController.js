const { fetchAllData } = require('../services/dbService');

async function getDbHandler(req, res) {
  const data = await fetchAllData();
  res.json(data);
}

module.exports = {
  getDbHandler
};