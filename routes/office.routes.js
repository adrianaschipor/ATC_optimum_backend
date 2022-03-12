const Office = require("../controllers/office.controllers");

const auth = require("../middlewares/authJwt");
const authAdmin = require("../middlewares/authAdmin");
const authAllAdminTypes = require("../middlewares/authAllAdminTypes");
const authAllUsers = require("../middlewares/authAllUsers");
const activeAccount = require("../middlewares/activeAccount");

module.exports = (app) => {
  // Endpoint for adding a new Office
  // Only an authenticated Admin with an active account can perform this
  app.post("/office", auth, authAdmin, activeAccount, Office.create);

  // Endpoint for updating an existing Office
  // Only an authenticated Admin with an active account can perform this
  app.put("/office/:officeId", auth, authAdmin, activeAccount, Office.update);

  // Endpoint for removing an existing Office
  // Only an authenticated Admin with an active account can perform this
  app.delete(
    "/office/:officeId",
    auth,
    authAdmin,
    activeAccount,
    Office.delete
  );

  // Endpoint for getting a list of all Offices (Office Status details included here)
  // Only an authenticated Admin or Office Admin with an active account can perform this
  app.get(
    "/allOffices",
    auth,
    authAllAdminTypes,
    activeAccount,
    Office.findAll
  );

  // Endpoint for getting a list of all Offices from a Building (Office Status details included here)
  // Only an authenticated Admin or Office Admin with an active account can perform this
  app.get(
    "/allOffices/:buildingId",
    auth,
    authAllAdminTypes,
    activeAccount,
    Office.findAllFromBuilding
  );

  // Endpoint for any User getting his Office Status
  // Any type of user with an active account can perform this
  app.get("/office/", auth, authAllUsers, activeAccount, Office.findOne);
};
