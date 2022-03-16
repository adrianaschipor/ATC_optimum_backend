const Sequelize = require("sequelize");
const db = require("../config/database.config");

const user = db.define("User", {
  firstname: {
    type: Sequelize.STRING(30),
    allowNull: false,
  },
  lastname: {
    type: Sequelize.STRING(30),
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING(50),
    allowNull: false,
    unique: true,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  role: {
    type: Sequelize.STRING,
    isIn: [["Admin"], ["Office Admin"], ["Employee"]],
    defaultValue: "Employee",
    allowNull: false,
  },
  gender: {
    type: Sequelize.STRING,
    isIn: [["Female"], ["Male"], ["Other"]],
    defaultValue: "employee",
    allowNull: false,
  },
  birthday: {
    type: Sequelize.DATEONLY,
    allowNull: true,
  },
  nationality: {
    type: Sequelize.STRING(30),
    allowNull: true,
  },
  active: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
});
user.sync({ alter: true });

module.exports = user;
