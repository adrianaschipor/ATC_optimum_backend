module.exports = (app) => {
  const Desk = require("../controllers/desk.controllers");

  //Create new Desk - used just not to add them manually, will be removed afterwards
  app.post("/desk", Desk.create);

  //Update existing Desk
  app.put("/desk/:deskId", Desk.update);

  //Assigning a desk
  // app.post("/desk-assign", Desk.assign);

  //Deassigning a desk
  //  app.post("/desk-deassign", Desk.deassign);

  //Get all Desks from an Office
  //  app.get("/allDesks/:officeId", Desk.findAllFromOffice);
};
