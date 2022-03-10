module.exports = (app) => {
  const RemoteReq = require("../controllers/remoteReq.controllers");
  const auth = require("../middlewares/authJwt");
  const authAdmin = require("../middlewares/authAdmin");
  const authAllUsers = require("../middlewares/authAllUsers");

  //Send a request to work remote
  app.post("/remoteReq", auth, authAllUsers, RemoteReq.create);

  //used for approving/rejecting a request
  app.put("/remoteReq/:remoteReqId", auth, authAdmin, RemoteReq.approval);

  //user gets to see all his remote requests, admin can see of all users
  app.get("/allRemoteReq", auth, authAllUsers, RemoteReq.findAll);

  //admin gets to see all pending requests
  app.get("/pendingRemoteReq", auth, authAdmin, RemoteReq.findAllPending);
};
