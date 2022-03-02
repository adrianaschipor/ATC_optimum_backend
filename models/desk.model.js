const { INTEGER } = require("sequelize");
const Sequelize = require("sequelize");
const db = require("../config/database.config");
const office_model = require("./office.model");
const user_model = require("./user.model");

const desk = db.define("Desk", {
  width: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  length: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  position: {
    // [ROW,COL]
    type: Sequelize.ARRAY(Sequelize.INTEGER),
    allowNull: false,
  },
  officeId: {
    type: Sequelize.INTEGER,
    references: {
      model: office_model,
      key: "id",
    },
    onDelete: "cascade",
    allowNull: false,
  },
  userId: {
    type: Sequelize.INTEGER,
    references: {
      model: user_model,
      key: "id",
    },
    allowNull: true,
  },
});

desk.sync({ alter: true });
module.exports = desk;
