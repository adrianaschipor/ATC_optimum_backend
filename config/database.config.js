const Sequelize = require("sequelize");

module.exports = new Sequelize("postgres", "postgres", "doYouEvenReact", {
  host: "localhost",
  dialect: "postgres",
});
