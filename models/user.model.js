const Sequelize = require("sequelize");
const db = require("../config/database.config");

const user = db.define("User", {
  firstname: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  lastname: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  role: {
    type: Sequelize.STRING,
    isIn: [["admin"], ["ofiice_admin"], ["employee"]],
    defaultValue: "employee",
    allowNull: false,
  },
  gender: {
    type: Sequelize.STRING,
    isIn: [["admin"], ["ofiice_admin"], ["employee"]],
    defaultValue: "employee",
    allowNull: false,
  },
  birthday: {
    type: Sequelize.DATEONLY,
    allowNull: true,
  },
  nationality: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  active: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  token: {
    type: Sequelize.STRING(5000),
  },
  code: {
    type: Sequelize.BIGINT,
  },
});
user.sync({ alter: true });

module.exports = user;
