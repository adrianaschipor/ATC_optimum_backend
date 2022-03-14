const auth = require("../middlewares/authJwt");
const authAllAdminTypes = require("../middlewares/authAllAdminTypes");
const authEmployee = require("../middlewares/authEmployee");
const activeAccount = require("../middlewares/activeAccount");

const DeskReq = require("../controllers/deskReq.controllers");
module.exports = (app) => {
  app.post("/deskReq", auth, authEmployee, activeAccount, DeskReq.create);
};
