const Desk = require("../models/desk.model");
const Office = require("../models/office.model");
const User = require("../models/user.model");
const RemoteReq = require("../models/remoteReq.model");

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

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

    // TO ADD : calculate maxDesks - check if adding this new desk would fit
    // check if position is valid
    // If all validations pass , increase totalDesksCount and usableDesksCount (if usable) for Office

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

// Admins and Office Admins can assign an user to an office
exports.assignToOffice = async (req, res) => {
  try {
    const { officeId, userId } = req.body;

    // get the office
    const office = await Office.findOne({ where: { id: officeId } });
    if (!office) return res.status(404).send(" Office not found !");
    // Office Administrator can assign desks only in the offices which are under his administration
    if (req.user.role === "Office Admin")
      if (office.officeAdminId != req.user.id)
        return res
          .status(403)
          .send("Forbbiden: This office is not under you administration.");
    // check if there are free desks in the office
    let freeDesks = [];
    freeDesks = await Desk.findAll({
      attributes: ["id"],
      where: { officeId: officeId, usable: true, userId: null },
    });
    if (freeDesks.length === 0)
      return res.status(400).send({ message: "No free desks in this office" });
    // check if the user exists
    const user = await User.findOne({ where: { id: userId } });
    if (!user) return res.status(404).send(" User not found !");

    //check if the user is currently fully working remote, so the percentage would go down to 0
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; //the +1 converts the month from digital (0-11) to normal.
    const working100Remote = await RemoteReq.findOne({
      where: {
        [Op.and]: [
          { userId: userId },
          { status: "Approved" },
          { year: currentYear },
          { month: currentMonth },
          { percentage: 100 },
        ],
      },
    });
    if (working100Remote) {
      working100Remote.percentage = 0;
      await working100Remote.save();
    }
    // check if the user is already occupying a desk in an office, so it becomes free
    let previousDesk = await Desk.findOne({ where: { userId: userId } });
    if (previousDesk) {
      // mark previous desk as free
      previousDesk.userId = null;
      await previousDesk.save();
    }
    // assign the user to the first usable free desk from the new office
    newDesk = await Desk.findOne({
      where: { officeId: officeId, userId: null, usable: true },
    });
    newDesk.userId = userId;
    await newDesk.save();

    return res.status(200).send("Desk successfully assigned!");
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};
