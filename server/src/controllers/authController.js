const { login } = require('../services/authService');

async function loginHandler(req, res) {
  const { user, password } = req.body;
  const result = await login(user, password);
  res.json(result);
}

module.exports = {
  loginHandler
};