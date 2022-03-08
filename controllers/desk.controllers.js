const Desk = require("../models/desk.model");
const Office = require("../models/office.model");
const User = require("../models/user.model");

//Create new Desk
exports.create = async (req, res) => {
  try {
    const { width, length, position, officeId } = req.body;

    //VALIDATIONS
    //width
    if (width < 1 || width > 500)
      return res.status(400).send({ message: "Invalid Width." });
    //length
    if (length < 1 || length > 500)
      return res.status(400).send({ message: "Invalid Length." });
    //officeId
    const office = await Office.findOne({ where: { id: officeId } });
    if (!office)
      return res
        .status(400)
        .send({ message: "Invalid Office: This office does't exist" });

    const newDesk = {
      width,
      length,
      position,
      officeId,
      userId: null,
    };

    const desk = await Desk.create(newDesk);
    return res.status(201).send(desk.id.toString());
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};
