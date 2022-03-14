const DeskReq = require("../models/deskReq.model");
const User = require("../models/user.model");
const Office = require("../models/office.model");
const Desk = require("../models/desk.model");

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

//Create new request
exports.create = async (req, res) => {
  try {
    const { officeId, requestReason } = req.body;
    //VALIDATIONS
    if (!requestReason || requestReason === "")
      return res.status(400).send({
        message:
          "Invalid Request Reason: You should provide a reason for your request",
      });
    if (requestReason.length > 2000)
      return res.status(400).send({
        message: "Invalid Request Reason: Your reason is too long",
      });

    const office = await Office.findOne({ where: { id: officeId } });
    if (!office) return res.status(404).send("Office not found.");

    // check if the office has at least one free desk
    const freeDesk = await Desk.findOne({
      attributes: ["id"],
      where: { officeId: officeId, usable: true, userId: null },
    });
    if (!freeDesk)
      return res.status(400).send({
        message: "Rejected: This Offce has no free desks",
      });

    //check if requesting user has a pending request
    const pendingReq = await DeskReq.findOne({
      where: { userId: req.user.id, status: "Pending" },
    });
    if (pendingReq)
      return res.status(400).send({
        message: "Rejected: You already have a pending request",
      });

    // create the new request
    const newDeskReq = {
      officeId,
      requestReason,
      status: "Pending",
      userId: req.user.id,
    };

    const deskReq = await DeskReq.create(newDeskReq);
    return res.status(201).send(deskReq.id.toString());
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};
