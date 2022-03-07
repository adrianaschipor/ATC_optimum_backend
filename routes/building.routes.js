module.exports = (app) => {
  const Building = require("../controllers/building.controllers");

  //Create new Building
  app.post("/building", Building.create);

  //Update existing Building
  app.put("/building/:buildingId", Building.update);

  //Delete existing Building
  app.delete("/building/:buildingId", Building.delete);

  //Get all Buildings
  app.get("/allBuildings", Building.findAll);

  //Get specific Building
  app.get("/building/:buildingId", Building.findOne);
};
