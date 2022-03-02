const Sequelize = require("sequelize");
const db = require("../config/database.config");
const office_model = require("./office.model");

const attachment = db.define("Attachment", {
  image: {
    type: Sequelize.STRING(1000000),
    allowNull: false,
  },
  officeId: {
    type: Sequelize.INTEGER,
    references: {
      model: office_model,
      key: "id",
    },
    onDelete: "cascade",
  },
});

attachment.sync({ alter: true });
module.exports = attachment;
