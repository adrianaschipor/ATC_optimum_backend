module.exports = (app) => {
  const Auth = require("../controllers/auth.controller");

  // Login endpoint
  app.post("/login", Auth.login);

  // Refresh token endpoint
  app.post("/refresh-token", Auth.refreshToken);
};
