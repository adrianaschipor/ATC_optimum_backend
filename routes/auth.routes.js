module.exports = (app) => {
  const Auth = require("../controllers/auth.controller");

  app.post("/login", Auth.login);
  app.post("/refresh-token", Auth.refreshToken);
};
