const Building = require("../controllers/building.controllers");

const auth = require("../middlewares/authJwt");
const authAdmin = require("../middlewares/authAdmin");
const activeAccount = require("../middlewares/activeAccount");

module.exports = (app) => {
  // Endpoint for adding a new building
  // Only an authenticated Admin with an active account can perform this
  app.post("/building", /* auth, authAdmin, activeAccount,*/ Building.create);

  // Endpoint for updating an existing building
  // Only an authenticated Admin with an active account can perform this
  app.put(
    "/allBuildings/:buildingId",
    /*  auth,
    authAdmin,
    activeAccount,*/
    Building.update
  );

  // Endpoint for removing an existing building
  // Only an authenticated Admin with an active account can perform this
  app.delete(
    "/allBuildings/:buildingId",
    /*  auth,
    authAdmin,
    activeAccount,*/
    Building.delete
  );

  // Endpoint for getting a list with all buildings
  // Only an authenticated Admin with an active account can perform this
  app.get(
    "/allBuildings",
    /* auth, authAdmin, activeAccount, */ Building.findAll
  );

  // Endpoint for getting details about a specific building (Building metrics included)
  // Only an authenticated Admin with an active account can perform this
  app.get(
    "/allBuildings/:buildingId",
    /*  auth,
    authAdmin,
    activeAccount,*/
    Building.findOne
  );
};
