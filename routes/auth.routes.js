module.exports = (app) => {
  const Auth = require("../controllers/auth.controller");

  // Login endpoint
  app.post("/login", Auth.login);

  // Refresh token endpoint
  app.get("/refresh-token", Auth.refreshToken);
};
