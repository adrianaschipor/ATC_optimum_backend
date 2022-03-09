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
    if (floorNo == null || floorNo > building.floorsCount || floorNo < 0)
      return res.status(400).send({ message: "Invalid Floor Number." });
    //totalDesksCount
    if (totalDesksCount < 0 || totalDesksCount > 300)
      return res.status(400).send({ message: "Invalid Total Desks Count." });
    //usableDesksCount
    if (usableDesksCount < 0 || usableDesksCount > totalDesksCount)
      return res.status(400).send({ message: "Invalid Usable Desks Count." });
    //width
    if (width < 5 || width > 500)
      return res.status(400).send({ message: "Invalid Width." });
    //length
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
    building = await Building.findOne({ where: { id: buildingId } });
    if (floorNo == null || floorNo > building.floorsCount || floorNo < 0)
      return res.status(400).send({ message: "Invalid Floor Number." });
    //totalDesksCount
    if (
      totalDesksCount < 0 ||
      totalDesksCount > 300 ||
      totalDesksCount < usableDesksCount
    )
      return res.status(400).send({ message: "Invalid Total Desks Count." });
    //usableDesksCount
    if (usableDesksCount < 0 || usableDesksCount > totalDesksCount)
      return res.status(400).send({ message: "Invalid Usable Desks Count." });
    //width
    if (width < 5 || width > 500)
      return res.status(400).send({ message: "Invalid Width." });
    //length
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
    // 1. Accept only the increasing of office size for now
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

    /*    if (currentOffice.totalDesksCount != currentOffice.usableDesksCount)
      return res
        .status(404)
        .send({ message: "Couldn't remove office: not all desks ar free" });*/

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
    return res.status(200).send(offices);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

//Get Office Status
exports.findOne = async (req, res) => {
  try {
    const office = await Office.findOne({
      where: { id: req.params.officeId },
    });
    if (!office) return res.status(404).send("Office not found.");

    return res.status(200).send(office);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};
