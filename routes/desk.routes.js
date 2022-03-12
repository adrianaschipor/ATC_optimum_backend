const auth = require("../middlewares/authJwt");
const authAllAdminTypes = require("../middlewares/authAllAdminTypes");
const authAllUsers = require("../middlewares/authAllUsers");
const activeAccount = require("../middlewares/activeAccount");
module.exports = (app) => {
  const Desk = require("../controllers/desk.controllers");

  // Endppoint for creating a new Desk - used when adding a new desk from 2D Visual Layout
  // Only an authenticated Admin or Office Admin with an active account can perform this
  app.post("/desk", auth, authAllAdminTypes, activeAccount, Desk.create);

  // Endpoint for updating existing Desk
  // Only an authenticated Admin or Office Admin with an active account can perform this
  app.put("/desk/:deskId", auth, authAllAdminTypes, activeAccount, Desk.update);

  // Endpoint for assigning an user to an office
  // Only an authenticated Admin or Office Admin with an active account can perform this
  app.post(
    "/assignToOffice",
    auth,
    authAllAdminTypes,
    activeAccount,
    Desk.assignToOffice
  );

  // Endpoint for deassigning an user from an office
  // Only an authenticated Admin or Office Admin with an active account can perform this
  app.post(
    "/deassignFromOffice",
    auth,
    authAllAdminTypes,
    activeAccount,
    Desk.deassignFromOffice
  );

  // Need to create different endpoints because of the "free desks condition" which is different
  // Endpoint for assigning an user to a desk - 2D visual layout
  // Only an authenticated Admin or Office Admin with an active account can perform this
  // app.post("/assignToOffice", auth, authAllAdminTypes, activeAccount, Desk.assignToDesk);

  // Endpoint for deassigning an user from a desk - 2D visual layout
  // Only an authenticated Admin or Office Admin with an active account can perform this
  //  app.post("/deassignFromOffice", auth, authAllAdminTypes, activeAccount, Desk.deassignFromDesk);

  // Endpoint for getting details about any office - 2D visual layout
  // Any authenticated user with an active account can perform this
  // Employees can see details only for the office that they're located in
  // app.get("/allDesks/:officeId", auth, authAllUsers, activeAccount, Desk.findAllFromOffice);
};
