const DeskReq = require("../models/deskReq.model");
const User = require("../models/user.model");
const Office = require("../models/office.model");
const Desk = require("../models/desk.model");
const RemoteReq = require("../models/remoteReq.model");

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

// Approve/Reject a request
// Approve / Reject a request
exports.approval = async (req, res) => {
  try {
    const { status, rejectReason } = req.body;

    const theReq = await DeskReq.findOne({
      where: { id: req.params.deskReqId },
    });
    if (!theReq) return res.status(404).send("Desk Request not found.");

    //VALIDATIONS
    //status
    if (status != "Approved" && status != "Rejected")
      return res.status(404).send("Invalid Status");
    //rejectReason
    if (status === "Rejected") {
      if (!rejectReason || rejectReason === "")
        return res.status(400).send({
          message:
            "Invalid Rejection Reason: You should provide a reason for your rejection",
        });
      if (rejectReason.length > 2000)
        return res.status(400).send({
          message: "Invalid Rejection Reason: Your reason is too long",
        });
    }
    // check if the office is administrated by this Office Admin
    const office = await Office.findOne({
      where: { id: theReq.officeId, officeAdminId: req.user.id },
    });
    if (!office)
      return res.status(403).json({
        msg: "Forbidden: This office is not under your administration",
      });

    // Treating desk approvement consequences
    if (status === "Approved") {
      // check again if there are any free desks in the office (maybe they got occupied meanwhile)
      const freeDesk = await Desk.findOne({
        where: { officeId: theReq.officeId, usable: true, userId: null },
      });
      if (!freeDesk)
        return res.status(400).send({
          message:
            "You cannot approve this request: This Offce has no free desks",
        });
      // previous desk occupied by user becomes free
      let previousDesk = await Desk.findOne({
        where: { userId: theReq.userId },
      });
      if (previousDesk) {
        previousDesk.userId = null;
        await previousDesk.save();
      }
      // user is assigned to the free desk from the new office
      freeDesk.userId = theReq.userId;
      await freeDesk.save();
      // if user is fully working remote, percentage goes down to 0
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1; //the +1 converts the month from digital (0-11) to normal.
      const working100Remote = await RemoteReq.findOne({
        where: {
          [Op.and]: [
            { userId: theReq.userId },
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
    }

    theReq.status = status;
    theReq.rejectReason = rejectReason;
    await theReq.save();
    return res.status(200).send("Desk Request successfully approved/rejected");
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

// get all pending requests for desks from an Office Admin offices
exports.findAllPending = async (req, res) => {
  try {
    // get the offices that are under this Office Admin administration
    const offices = await Office.findAll({
      attributes: ["id"],
      where: { officeAdminId: req.user.id },
    });

    //Select only those requests for offices that are under this Office Admin's administration
    let allRequests = [];
    for (const office of offices) {
      let requestsForOffice = [];
      requestsForOffice = await DeskReq.findAll({
        where: { status: "Pending", officeId: office.id },
      });
      if (requestsForOffice)
        allRequests = allRequests.concat(requestsForOffice);
    }
    return res.status(200).send(allRequests);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

// get all user's requests
exports.findAll = async (req, res) => {
  try {
    let allRequests = [];
    allRequests = await DeskReq.findAll({ where: { userId: req.user.id } });
    return res.status(200).send(allRequests);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};
