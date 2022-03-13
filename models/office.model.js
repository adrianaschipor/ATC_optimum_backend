const Sequelize = require("sequelize");
const db = require("../config/database.config");
const building_model = require("./building.model");
const user_model = require("./user.model");

const office = db.define("Office", {
  name: {
    type: Sequelize.STRING(30),
    allowNull: false,
  },
  floorNo: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  totalDesksCount: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  usableDesksCount: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  width: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  length: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  buildingId: {
    type: Sequelize.INTEGER,
    references: {
      model: building_model,
      key: "id",
    },
    onDelete: "cascade",
    allowNull: false,
  },
  officeAdminId: {
    type: Sequelize.INTEGER,
    references: {
      model: user_model,
      key: "id",
    },
    allowNull: true,
  },
});

office.sync({ alter: true });
module.exports = office;
