const User = require("../controllers/user.controllers");
const auth = require("../middlewares/authJwt");
const authAdmin = require("../middlewares/authAdmin");
const authOfficeAdmin = require("../middlewares/authOfficeAdmin");
const authAllAdminTypes = require("../middlewares/authAllAdminTypes");
const authAllUsers = require("../middlewares/authAllUsers");
const activeAccount = require("../middlewares/activeAccount");

module.exports = (app) => {
  // Endpoint for creating a new user
  // Only an authenticated Admin with an active account can perform this
  app.post("/user", auth, authAdmin, activeAccount, User.create);

  // Endpoint for updating an existing user, change of "active" (activate/deactivate) is also treated here
  // Only an authenticated Admin with an active account can perform this
  app.put("/user/:userId", auth, authAdmin, activeAccount, User.update);

  // Endpoint used for getting all office admins when adding/updating an office
  // Only an authenticated Admin with an active account can perform this
  app.get(
    "/allOfficeAdmins",
    auth,
    authAdmin,
    activeAccount,
    User.findAllOfficeAdmins
  );

  // Endpoint for getting all users based on name search
  // This is available for all authenticated users with an active account
  // Admins get more details than other type of user
  app.get(
    "/allUsers/:name",
    auth,
    authAllUsers,
    activeAccount,
    User.findAllByName
  );

  // Get all users from an Office Admin offices -> May or may not be needed
  //   app.get("/allUsersOfOfficeAdmin", auth, authOfficeAdmin,User.findAllUsersOfOfficeAdmin);

  // Endpoint for geting all users - !! NOT needed -> included in findAllByName, no substring introduced situation -> Don't know for sure yet, also not required
  // This is used for visualising users when selecting one
  //app.get("/allUsers", auth, authAllAdminTypes, User.findAll);
};
