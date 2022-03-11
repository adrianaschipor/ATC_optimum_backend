const Office = require("../controllers/office.controllers");

const auth = require("../middlewares/authJwt");
const authAdmin = require("../middlewares/authAdmin");
const authAllAdminTypes = require("../middlewares/authAllAdminTypes");
const authAllUsers = require("../middlewares/authAllUsers");
const activeAccount = require("../middlewares/activeAccount");

module.exports = (app) => {
  //Create new Office
  app.post("/office", auth, authAdmin, activeAccount, Office.create);

  //Update existing Office
  app.put("/office/:officeId", auth, authAdmin, activeAccount, Office.update);

  //Delete existing Office
  app.delete(
    "/office/:officeId",
    auth,
    authAdmin,
    activeAccount,
    Office.delete
  );

  //Get all Offices
  app.get(
    "/allOffices",
    auth,
    authAllAdminTypes,
    activeAccount,
    Office.findAll
  );

  //Get all Offices from a building
  app.get(
    "/allOffices/:buildingId",
    auth,
    authAllAdminTypes,
    activeAccount,
    Office.findAllFromBuilding
  );

  //Get Office Status
  app.get(
    "/office/:officeId",
    auth,
    authAllUsers,
    activeAccount,
    Office.findOne
  );
};
