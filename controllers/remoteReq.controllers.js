const RemoteReq = require("../models/remoteReq.model");
const Desk = require("../models/desk.model");
const User = require("../models/user.model");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

//Create new request
exports.create = async (req, res) => {
  try {
    const { /*startDate,*/ percentage, requestReason } = req.body;
    //VALIDATIONS
    if (isNaN(percentage) || isNaN(parseFloat(percentage)))
      return res.status(400).send({
        message: "Invalid percentage: Percentage must be a number",
      });

    if (percentage < 5 || percentage > 100)
      return res.status(400).send({
        message:
          "Invalid percentage: cannot be lower than 5 or greater than 100",
      });
    if (!requestReason || requestReason === "")
      return res.status(400).send({
        message:
          "Invalid Request Reason: You should provide a reason for your request",
      });
    if (requestReason.length > 50)
      return res.status(400).send({
        message: "Invalid Request Reason: Your reason is too long",
      });

    // CONSTRAINTS

    //const userId = req.user.id;
    const userId = 4; // We assume that user with id 4 is making this request as long as we don't have login functionality
    // !!!!! Make sure this user exists in database

    // check if the requesting user is already working remote this month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; //the +1 converts the month from digital (0-11) to normal.
    const alreadyRemote = await RemoteReq.findOne({
      where: {
        [Op.and]: [
          { userId: userId },
          { status: "Approved" },
          { year: currentYear },
          { month: currentMonth },
        ],
      },
    });
    if (alreadyRemote)
      return res.status(400).send({
        message: "Rejected: Already working remote",
      });

    //check if requesting user has a pending request for this month
    const pendingReq = await RemoteReq.findOne({
      where: {
        [Op.and]: [
          { userId: userId },
          { status: "Pending" },
          { year: currentYear },
          { month: currentMonth },
        ],
      },
    });
    if (pendingReq)
      return res.status(400).send({
        message: "Rejected: You have a pending request for this month",
      });

    // create the new request
    const newRemoteReq = {
      percentage,
      requestReason,
      year: currentYear,
      month: currentMonth,
      status: "Pending",
      userId: userId,
    };

    const remoteReq = await RemoteReq.create(newRemoteReq);
    return res.status(201).send(remoteReq.id.toString());
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

// Approve / Reject a request
exports.approval = async (req, res) => {
  try {
    const { status, rejectReason } = req.body;

    const theReq = await RemoteReq.findOne({
      where: { id: req.params.remoteReqId },
    });
    if (!theReq) return res.status(404).send("Remote Request not found.");

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
      if (rejectReason.length > 50)
        return res.status(400).send({
          message: "Invalid Rejection Reason: Your reason is too long",
        });
    }
    // If a request to work 100% remote is approved, the occupied desk by user becomes free
    if (status === "Approved" && theReq.percentage === 100) {
      let desk = await Desk.findOne({ where: { userId: theReq.userId } });
      if (desk) {
        desk.userId = null;
        await desk.save();
      }
    }

    theReq.status = status;
    theReq.rejectReason = rejectReason;
    await theReq.save();
    return res
      .status(200)
      .send("Remote Request successfully approved/rejected");
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

// get all remote requests
exports.findAll = async (req, res) => {
  try {
    let requests = {};
    //the Admin gets to see all the requests, while the other users can see only their own requests
    if (req.user.role === "Admin") {
      requests = await RemoteReq.findAll();
    } else {
      requests = await RemoteReq.findAll({ where: { userId: req.user.id } });
    }
    return res.status(200).send(requests);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

// get all pending requests
exports.findAllPending = async (req, res) => {
  try {
    let requests = {};
    requests = await RemoteReq.findAll({ where: { status: "Pending" } });
    for (const request of requests) {
      const user = await User.findOne({
        attributes: ["firstname", "lastname"],
        where: { id: request.userId },
      });
      if (user)
        request.dataValues.username = user.firstname + " " + user.lastname;
    }
    return res.status(200).send(requests);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};
