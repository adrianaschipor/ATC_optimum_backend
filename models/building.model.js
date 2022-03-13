const Sequelize = require("sequelize");
const db = require("../config/database.config");

const building = db.define("Building", {
  name: {
    type: Sequelize.STRING(30),
    allowNull: false,
  },
  floorsCount: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  address: {
    type: Sequelize.STRING(50),
    allowNull: false,
  },
});

building.sync({ alter: true });
module.exports = building;
