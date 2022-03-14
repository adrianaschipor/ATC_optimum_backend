const Office = require("../models/office.model");
const Building = require("../models/building.model");
const User = require("../models/user.model");
const Desk = require("../models/desk.model");
// calculate how many desks fit inside office
const DEFAULT_DESK_WIDTH = 0.5;
const DEFAULT_DESK_LENGTH = 1;
//We take in consideration that a desk placed inside an office needs more space than its size
const neededWidthPerDesk = DEFAULT_DESK_WIDTH + 1.5;
const neededLengthPerDesk = DEFAULT_DESK_LENGTH + 1;

//Create new Office
exports.create = async (req, res) => {
  try {
    const { name, buildingId, floorNo, width, length, officeAdminId } =
      req.body;
    let { totalDesksCount, usableDesksCount } = req.body;

    //VALIDATIONS
    //name
    if (name == null || name.length > 30)
      return res.status(400).send({ message: "Invalid Name." });
    //buildingId
    if (buildingId == null)
      return res.status(400).send({ message: "Invalid Building." });
    const building = await Building.findOne({ where: { id: buildingId } });
    if (!building)
      return res
        .status(400)
        .send({ message: "Invalid Building: This building doesn't exist" });
    //already existing
    existingOffice = await Office.findOne({
      where: { name: name, buildingId: buildingId },
    });
    if (existingOffice)
      return res.status(400).send({
        message:
          "Invalid Name: There's already an office with this name in this building",
      });
    //floorNo
    if (isNaN(floorNo) || isNaN(parseInt(floorNo)))
      return res.status(400).send({
        message: "Invalid Floor No: must be a number",
      });
    if (floorNo == null || floorNo > building.floorsCount || floorNo < 0)
      return res.status(400).send({ message: "Invalid Floor Number." });
    //totalDesksCount
    if (isNaN(totalDesksCount) || isNaN(parseInt(totalDesksCount)))
      return res.status(400).send({
        message: "Invalid Total Desks Count: must be a number",
      });
    if (totalDesksCount < 0 || totalDesksCount > 300)
      return res.status(400).send({ message: "Invalid Total Desks Count." });
    //usableDesksCount
    if (isNaN(usableDesksCount) || isNaN(parseInt(usableDesksCount)))
      return res.status(400).send({
        message: "Invalid Usable Desks Count: must be a number",
      });
    if (usableDesksCount < 0 || usableDesksCount > totalDesksCount)
      return res.status(400).send({ message: "Invalid Usable Desks Count." });
    //width
    if (isNaN(width) || isNaN(parseFloat(width)))
      return res.status(400).send({
        message: "Invalid Width: must be a number",
      });
    if (width < 5 || width > 500)
      return res.status(400).send({ message: "Invalid Width." });
    //length
    if (isNaN(length) || isNaN(parseFloat(length)))
      return res.status(400).send({
        message: "Invalid Length: must be a number",
      });
    if (length < 5 || length > 500)
      return res.status(400).send({ message: "Invalid Length." });
    //officeAdminId - optional
    if (officeAdminId != null) {
      const officeAdmin = await User.findOne({ where: { id: officeAdminId } });
      if (!officeAdmin)
        return res
          .status(400)
          .send({ message: "Invalid Office Admin: This user doesn't exist" });
      if (officeAdmin.role != "Office Admin")
        return res.status(400).send({
          message: "Invalid Office Admin: This user isn't an Office Admin",
        });
    }

    // calculate how many desks fit inside office
    let prefRowsCount = Math.floor(width / neededWidthPerDesk);
    let prefColumnsCount = Math.floor(length / neededLengthPerDesk);
    let maxDesksCount = prefRowsCount * prefColumnsCount;
    // we place only as many officess as they can fit inside office
    if (totalDesksCount > maxDesksCount) totalDesksCount = maxDesksCount;
    if (usableDesksCount > maxDesksCount) usableDesksCount = maxDesksCount;

    const newOffice = {
      name,
      floorNo,
      totalDesksCount,
      usableDesksCount,
      width,
      length,
      buildingId,
      officeAdminId,
    };

    const office = await Office.create(newOffice);

    //Add to database all desks from this new Office
    let usableDesks = usableDesksCount;
    let unusableDesks = totalDesksCount - usableDesksCount;
    for (let i = 1; i <= prefRowsCount; i++)
      for (let j = 1; j <= prefColumnsCount; j++) {
        if (usableDesks == 0 && unusableDesks == 0) break;
        //add to database usable Desks
        if (usableDesks != 0) {
          await Desk.create({
            width: DEFAULT_DESK_WIDTH,
            length: DEFAULT_DESK_LENGTH,
            position: [i, j],
            usable: true,
            officeId: office.id,
            userId: null,
          });
          usableDesks--;
        } else {
          //add to database unusable Desks
          await Desk.create({
            width: DEFAULT_DESK_WIDTH,
            length: DEFAULT_DESK_LENGTH,
            position: [i, j],
            usable: false,
            officeId: office.id,
            userId: null,
          });
          unusableDesks--;
        }
      }
    return res.status(201).send(office.id.toString());
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

//Update existing Office
exports.update = async (req, res) => {
  try {
    const currentOffice = await Office.findOne({
      where: { id: req.params.officeId },
    });
    if (!currentOffice) return res.status(404).send("Office not found.");

    const {
      name,
      buildingId,
      floorNo,
      totalDesksCount,
      usableDesksCount,
      width,
      length,
      officeAdminId,
    } = req.body;

    //VALIDATIONS
    //name
    if (name == null || name.length > 30)
      return res.status(400).send({ message: "Invalid Name." });
    //buildingId : makes no sense to move a whole office from a building to another
    if (buildingId != currentOffice.buildingId)
      return res
        .status(400)
        .send({ message: "You cannot modify the building." });
    //already existing
    existingOffice = await Office.findOne({
      where: { name: name, buildingId: buildingId },
    });
    if (existingOffice && name != currentOffice.name)
      return res.status(400).send({
        message:
          "Invalid Name: There's already an office with this name in this building",
      });

    //floorNo
    if (isNaN(floorNo) || isNaN(parseInt(floorNo)))
      return res.status(400).send({
        message: "Invalid Floor No: must be a number",
      });
    const building = await Building.findOne({ where: { id: buildingId } });
    if (floorNo == null || floorNo > building.floorsCount || floorNo < 0)
      return res.status(400).send({ message: "Invalid Floor Number." });
    //totalDesksCount
    if (isNaN(totalDesksCount) || isNaN(parseInt(totalDesksCount)))
      return res.status(400).send({
        message: "Invalid Total Desks Count: must be a number",
      });
    if (
      totalDesksCount < 0 ||
      totalDesksCount > 300 ||
      totalDesksCount < usableDesksCount
    )
      return res.status(400).send({ message: "Invalid Total Desks Count." });
    //usableDesksCount
    if (isNaN(usableDesksCount) || isNaN(parseInt(usableDesksCount)))
      return res.status(400).send({
        message: "Invalid Usable Desks Count: must be a number",
      });
    if (usableDesksCount < 0 || usableDesksCount > totalDesksCount)
      return res.status(400).send({ message: "Invalid Usable Desks Count." });
    //width
    if (isNaN(width) || isNaN(parseFloat(width)))
      return res.status(400).send({
        message: "Invalid Width: must be a number",
      });
    if (width < 5 || width > 500)
      return res.status(400).send({ message: "Invalid Width." });
    //length
    if (isNaN(length) || isNaN(parseFloat(length)))
      return res.status(400).send({
        message: "Invalid Length: must be a number",
      });
    if (length < 5 || length > 500)
      return res.status(400).send({ message: "Invalid Length." });
    //officeAdminId - optional
    if (officeAdminId != null) {
      const officeAdmin = await User.findOne({ where: { id: officeAdminId } });
      if (!officeAdmin)
        return res
          .status(400)
          .send({ message: "Invalid Office Admin: This user doesn't exist" });
      if (officeAdmin.role != "Office Admin")
        return res.status(400).send({
          message: "Invalid Office Admin: This user isn't an Office Admin",
        });
    }

    // !!!TO ADD:
    // 1. Accept only the increasing of office size for now, no time for treating all the decreasing consequences
    // 2. Handle Desks if totalDesksCount and usableDesksCount are modified (should calculate rows, columns, maxDesks, free positions
    // T = totalDesksCount, U= usableDesksCount
    // all 9 situations:
    // T=, U= -> no changes
    // T=, U> -> make some existing unusable desks to be usable
    // T=, U< -> make some existing usable (+free) desks to be unusable
    // T>, U= -> add some new unsusable desks
    // T>, U> -> add some new usable desks
    // T>, U< -> add some new unsusable desks + make some existing usable(+free) desks to be unusable
    // T<, U= -> remove some unusable desks
    // T<, U> -> remove some unusable desks + make some unusable desks to be usable
    // T<, U< -> remove some usable (+ free) desks
    //OBS: When adding, pay attention to place them into free positions

    const updatedOffice = {
      name,
      floorNo,
      totalDesksCount,
      usableDesksCount,
      width,
      length,
      buildingId,
      officeAdminId,
    };
    if (
      (await Office.update(updatedOffice, {
        where: { id: req.params.officeId },
      })) != 1
    )
      return res.status(404).send("Couldn't update Office !");
    return res.status(200).send("Office successfully updated !");
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

//Delete existing Office
exports.delete = async (req, res) => {
  try {
    const currentOffice = await Office.findOne({
      where: { id: req.params.officeId },
    });
    if (!currentOffice) return res.status(404).send("Office not found.");

    // check if all usable desks are free
    const freeDesks = await Desk.findAll({
      where: { officeId: currentOffice.id, usable: true, userId: null },
    });
    if (freeDesks.length != currentOffice.usableDesksCount)
      return res.status(400).send({
        message: "Cannot remove office: Not all usable desks are free",
      });

    if ((await Office.destroy({ where: { id: req.params.officeId } })) != 1)
      return res.status(404).send({ message: "Couldn't remove office." });
    return res.status(200).send({ message: "Office successfully removed !" });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

//Get all offices
exports.findAll = async (req, res) => {
  try {
    let offices = {};
    offices = await Office.findAll();

    // Add Status details
    if (offices) {
      for (let office of offices) {
        // Add building details
        const building = await Building.findOne({
          where: { id: office.buildingId },
        });
        if (building) office.dataValues.buildingName = building.name;
        // Add Office Administrator details
        const officeAdmin = await User.findOne({
          attributes: ["firstname", "lastname"],
          where: { id: office.officeAdminId },
        });
        if (officeAdmin)
          office.dataValues.officeAdminName =
            officeAdmin.firstname + " " + officeAdmin.lastname;
        // Add list of names of all users from office
        const desks = await Desk.findAll({
          attributes: ["userId"],
          where: { officeId: office.id },
        });
        if (desks) {
          let officeUsers = [];
          for (const desk of desks) {
            const user = await User.findOne({
              attributes: ["firstname", "lastname"],
              where: { id: desk.userId },
            });
            if (user) officeUsers.push(user.firstname + " " + user.lastname);
          }
          office.dataValues.officeUsers = officeUsers;
        }
        // add free desks count
        let freeDesks = [];
        freeDesks = await Desk.findAll({
          attributes: ["userId"],
          where: { officeId: office.id, usable: true, userId: null },
        });
        const freeDesksCount = freeDesks.length;
        office.dataValues.freeDesksCount = freeDesksCount;
        // add occupied desks count
        office.dataValues.occupiedDesksCount =
          office.usableDesksCount - freeDesksCount;
        // add occupation percentage
        if (office.usableDesksCount != 0)
          office.dataValues.occupationPercentage =
            office.dataValues.occupiedDesksCount / office.usableDesksCount;
        else office.occupationPercentage = 0;
      }
    }
    return res.status(200).send(offices);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

//Get all offices from a building
exports.findAllFromBuilding = async (req, res) => {
  try {
    let offices = {};
    offices = await Office.findAll({
      where: { buildingId: req.params.buildingId },
    });
    // Add Status details
    if (offices) {
      for (let office of offices) {
        // Add building details
        const building = await Building.findOne({
          where: { id: office.buildingId },
        });
        if (building) office.dataValues.buildingName = building.name;
        // Add Office Administrator details
        const officeAdmin = await User.findOne({
          attributes: ["firstname", "lastname"],
          where: { id: office.officeAdminId },
        });
        if (officeAdmin)
          office.dataValues.officeAdminName =
            officeAdmin.firstname + " " + officeAdmin.lastname;
        // Add list of names of all users from office
        const desks = await Desk.findAll({
          attributes: ["userId"],
          where: { officeId: office.id },
        });
        if (desks) {
          let officeUsers = [];
          for (const desk of desks) {
            const user = await User.findOne({
              attributes: ["firstname", "lastname"],
              where: { id: desk.userId },
            });
            if (user) officeUsers.push(user.firstname + " " + user.lastname);
          }
          office.dataValues.officeUsers = officeUsers;
        }
        // add free desks count
        let freeDesks = [];
        freeDesks = await Desk.findAll({
          attributes: ["userId"],
          where: { officeId: office.id, usable: true, userId: null },
        });
        const freeDesksCount = freeDesks.length;
        office.dataValues.freeDesksCount = freeDesksCount;
        // add occupied desks count
        office.dataValues.occupiedDesksCount =
          office.usableDesksCount - freeDesksCount;
        // add occupation percentage
        if (office.usableDesksCount != 0)
          office.dataValues.occupationPercentage =
            office.dataValues.occupiedDesksCount / office.usableDesksCount;
        else office.occupationPercentage = 0;
      }
    }
    return res.status(200).send(offices);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

//Get Office Status - any user can see his office status
exports.findOne = async (req, res) => {
  try {
    // find user's office based on assigned desk
    const desk = await Desk.findOne({
      attributes: ["officeId"],
      where: { userId: req.user.id },
    });
    if (!desk) return res.status(200).send("You're not assigned to any desk");
    // find exact office
    const office = await Office.findOne({
      where: { id: desk.officeId },
    });
    if (!office)
      return res
        .status(200)
        .send("The desk you're assigned to doesn't belong to any office");

    // Add Status details
    // Add building details
    const building = await Building.findOne({
      where: { id: office.buildingId },
    });
    if (building) office.dataValues.buildingName = building.name;
    // Add Office Administrator details
    const officeAdmin = await User.findOne({
      attributes: ["firstname", "lastname"],
      where: { id: office.officeAdminId },
    });
    if (officeAdmin)
      office.dataValues.officeAdminName =
        officeAdmin.firstname + " " + officeAdmin.lastname;
    // Add list of names of all users from office
    const desks = await Desk.findAll({
      attributes: ["userId"],
      where: { officeId: office.id },
    });
    if (desks) {
      let officeUsers = [];
      for (const desk of desks) {
        const user = await User.findOne({
          attributes: ["firstname", "lastname"],
          where: { id: desk.userId },
        });
        if (user) officeUsers.push(user.firstname + " " + user.lastname);
      }
      office.dataValues.officeUsers = officeUsers;
    }
    // add free desks count
    let freeDesks = [];
    freeDesks = await Desk.findAll({
      attributes: ["userId"],
      where: { officeId: office.id, usable: true, userId: null },
    });
    const freeDesksCount = freeDesks.length;
    office.dataValues.freeDesksCount = freeDesksCount;
    // add occupied desks count
    office.dataValues.occupiedDesksCount =
      office.usableDesksCount - freeDesksCount;
    // add occupation percentage
    if (office.usableDesksCount != 0)
      office.dataValues.occupationPercentage =
        office.dataValues.occupiedDesksCount / office.usableDesksCount;
    else office.occupationPercentage = 0;

    return res.status(200).send(office);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};
