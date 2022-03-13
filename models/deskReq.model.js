const Sequelize = require("sequelize");
const db = require("../config/database.config");
const user_model = require("./user.model");
const office_model = require("./office.model");

const deskReq = db.define("DeskRequest", {
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
  officeId: {
    type: Sequelize.INTEGER,
    references: {
      model: office_model,
      key: "id",
    },
    allowNull: false,
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

deskReq.sync({ alter: true });
module.exports = deskReq;
