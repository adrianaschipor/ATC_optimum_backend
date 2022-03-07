module.exports = (app) => {
  const Office = require("../controllers/office.controllers");

  //Create new Office
  app.post("/office", Office.create);

  //Update existing Office
  app.put("/office/:officeId", Office.update);

  //Delete existing Office
  app.delete("/office/:officeId", Office.delete);

  //Get all Offices
  app.get("/allOffices", Office.findAll);

  //Get all Offices from a building
  app.get("/allOffices/:buildingId", Office.findAllFromBuilding);

  //Get  Office Status
  app.get("/office/:officeId", Office.findOne);
};
