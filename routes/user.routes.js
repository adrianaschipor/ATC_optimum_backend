module.exports = (app) => {
  const User = require("../controllers/user.controllers");
  const auth = require("../middlewares/authJwt");
  const authAdmin = require("../middlewares/authAdmin");
  const authOfficeAdmin = require("../middlewares/authOfficeAdmin");
  const authAllAdminTypes = require("../middlewares/authAllAdminTypes");
  const authAllUsers = require("../middlewares/authAllUsers");

  //Create new User
  app.post("/user", auth, authAdmin, User.create);

  //Update existing User
  app.put("/user/:userId", auth, authAdmin, User.update);

  //Get all users
  app.get("/allUsers", auth, authAllAdminTypes, User.findAll);

  //Get all office admins
  app.get("/allOfficeAdmins", auth, authAdmin, User.findAllOfficeAdmins);

  //Get all users from an Office Admin offices
  //   app.get("/allUsersOfOfficeAdmin", auth, authOfficeAdmin,User.findAllUsersOfOfficeAdmin);

  //Get user status
  //app.get("/user/:name", auth, authAllUsers,User.findAllByName);
};
