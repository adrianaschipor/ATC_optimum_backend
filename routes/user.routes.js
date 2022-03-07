module.exports = (app) => {
  const User = require("../controllers/user.controllers");

  //Create new User
  app.post("/user", User.create);

  //Update existing User
  app.put("/user/:userId", User.update);

  //Get all users
  app.get("/allUsers", User.findAll);

  //Get all office admins
  app.get("/allOfficeAdmins", User.findAllOfficeAdmins);

  //Get all users from an Office Admin offices
  //   app.get("/allUsersOfOfficeAdmin", User.findAllUsersOfOfficeAdmin);

  //Get user status
  //app.get("/user/:name", User.findOne);
};
