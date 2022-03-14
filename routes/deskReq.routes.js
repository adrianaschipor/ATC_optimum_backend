const auth = require("../middlewares/authJwt");
const authOffceAdmin = require("../middlewares/authOfficeAdmin");
const authEmployee = require("../middlewares/authEmployee");
const activeAccount = require("../middlewares/activeAccount");

const DeskReq = require("../controllers/deskReq.controllers");
module.exports = (app) => {
  // Endpoint for submiting a desk request
  // Only an authenticated Employee with an active account can perform this
  app.post("/deskReq", auth, authEmployee, activeAccount, DeskReq.create);

  // Endpoint for aproving/rjecting a desk request
  // Only an authenticated Office Admin with an active account can perform this
  app.put(
    "/deskReq/:deskReqId",
    auth,
    authOffceAdmin,
    activeAccount,
    DeskReq.approval
  );

  // Endpoint for getting a list of all pending request for an office admin offices
  // Only an authenticated Office Admin with an active account can perform this
  app.get(
    "/pendingDeskReq",
    auth,
    authOffceAdmin,
    activeAccount,
    DeskReq.findAllPending
  );

  // Endpoint for getting a list of all user's request
  // Only an authenticated Employee with an active account can perform this
  app.get("/allDeskReq", auth, authEmployee, activeAccount, DeskReq.findAll);
};
