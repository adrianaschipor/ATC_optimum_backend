const Sequelize = require("sequelize");
const db = require("../config/database.config");
const user_model = require("./user.model");

const remoteReq = db.define("RemoteRequests", {
  percentage: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  startDated: {
    type: Sequelize.DATEONLY,
    allowNull: false,
  },
  requestReason: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  status: {
    type: Sequelize.STRING,
    isIn: [["Pending"], ["Approved"], ["Rejected"]],
    default: "Pending",
    allowNull: false,
  },
  rejectReason: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  userId: {
    type: Sequelize.INTEGER,
    references: {
      model: user_model,
      key: "id",
    },
    allowNull: false,
  },
});

remoteReq.sync({ alter: true });
module.exports = remoteReq;
