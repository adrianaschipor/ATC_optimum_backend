const RemoteReq = require("../models/remoteReq.model");
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
    if (requestReason.length > 2000)
      return res.status(400).send({
        message: "Invalid Request Reason: Your reason is too long",
      });

    // CONSTRAINTS

    // check if the requesting user is already working remote this month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; //the +1 converts the month from digital (0-11) to normal.
    const alreadyRemote = await RemoteReq.findOne({
      where: {
        [Op.and]: [
          { userId: req.user.id },
          { status: "Approved" },
          { year: currentYear },
          { month: currentMonth },
        ],
      },
    });
    if (alreadyRemote)
      return res.status(400).send({
        message: "Cannot send request: Already working remote",
      });

    //check if requesting user has a pending request for this month
    const pendingReq = await RemoteReq.findOne({
      where: {
        [Op.and]: [
          { userId: req.user.id },
          { status: "Pending" },
          { year: currentYear },
          { month: currentMonth },
        ],
      },
    });
    if (pendingReq)
      return res.status(400).send({
        message:
          "Cannot send request: You have a pending request for this month",
      });

    // create the new request
    const newRemoteReq = {
      percentage,
      requestReason,
      year: currentYear,
      month: currentMonth,
      status: "Pending",
      userId: req.user.id,
    };

    const remoteReq = await RemoteReq.create(newRemoteReq);
    return res.status(201).send(remoteReq.id.toString());
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};
