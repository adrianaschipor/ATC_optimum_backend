const Desk = require("../models/desk.model");
const Office = require("../models/office.model");
const User = require("../models/user.model");

//Create new Desk
exports.create = async (req, res) => {
  try {
    const { width, length, position, usable, officeId } = req.body;

    //VALIDATIONS
    //width
    if (width < 0.3 || width > 2)
      return res.status(400).send({ message: "Invalid Width." });
    //length
    if (length < 0.5 || length > 3)
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
      usable: true,
      officeId,
      userId: null,
    };

    const desk = await Desk.create(newDesk);
    return res.status(201).send(desk.id.toString());
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

// Update desk - assign, deassign
exports.update = async (req, res) => {
  try {
    const currentDesk = await Desk.findOne({
      where: { id: req.params.deskId },
    });
    if (!currentDesk) return res.status(404).send("Desk not found.");

    const { width, length, position } = req.body;

    //VALIDATIONS
    //width + !!TO CHECK if possible based on office width and occupated width on that column
    if (width < 0.3 || width > 2)
      return res.status(400).send({ message: "Invalid Width." });
    //length  + !!TO CHECK if possible based on office length and occupated length on that row
    if (length < 0.5 || length > 3)
      return res.status(400).send({ message: "Invalid Length." });

    //position: validate position based on rows and column from office (to implement)

    const updatedDesk = {
      width,
      length,
      position,
      usable: currentDesk.usable, //updating desk status feature is not implemented yet (also not required)
      officeId: currentDesk.officeId, //updating office feature is not implemented (also not required)
      userId: currentDesk.userId, //changing it is treated in assign/deassign
    };

    if (
      (await Desk.update(updatedDesk, {
        where: { id: req.params.deskId },
      })) != 1
    )
      return res.status(404).send("Couldn't update Desk !");
    return res.status(200).send("Desk successfully updated !");
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};
