const Sequelize = require("sequelize");
const db = require("../config/database.config");

const building = db.define("Building", {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  floorsCount: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  address: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

building.sync({ alter: true });
module.exports = building;
