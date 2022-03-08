const Office = require("../models/office.model");
const Building = require("../models/building.model");
const User = require("../models/user.model");
const Desk = require("../models/desk.model");

//Create new Office
exports.create = async (req, res) => {
  try {
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
    //buildingId
    if (buildingId == null)
      return res.status(400).send({ message: "Invalid Building." });
    building = await Building.findOne({ where: { id: buildingId } });
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

    // check if totalDesksCount fit inside office
    const defaultDeskWidth = 0.5;
    const defaultDeskLength = 1;
    //We take in consideration that a desk placed inside an office needs more space than its size
    const neededWidthPerDesk = defaultDeskWidth + 1.5;
    const neededLengthPerDesk = defaultDeskLength + 1;
    let prefRowsCount = Math.floor(width / neededWidthPerDesk);
    let prefColumnsCount = Math.floor(length / neededLengthPerDesk);

    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\n\n\n");
    //console.log(Desk.neededLength + " " + Desk.neededWidth);
    console.log(prefColumnsCount + " " + prefRowsCount);
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\n\n\n");

    if (prefColumnsCount * prefRowsCount < totalDesksCount)
      return res.status(400).send({
        message: "Invalid Total Desks Count: The Office is not large enough.",
      });

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

    //create all usable desks
    // for (let i = 0; i < usableDesksCount; i++) await Desk.create({});

    const office = await Office.create(newOffice);
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

    if (currentOffice.totalDesksCount != currentOffice.usableDesksCount)
      return res
        .status(404)
        .send({ message: "Couldn't remove office: not all desks ar free" });

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
