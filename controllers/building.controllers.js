const Building = require("../models/building.model");
const Office = require("../models/office.model");
const Desk = require("../models/desk.model");

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

//Create new Building
exports.create = async (req, res) => {
  try {
    const { name, address, floorsCount } = req.body;

    //VALIDATIONS
    //name
    if (name == null || name.length > 30)
      return res.status(400).send({ message: "Invalid Name." });
    //address
    if (address == null || address.length > 50)
      return res.status(400).send({ message: "Invalid Address." });
    // check if there is already a building at that address
    const existingBuilding = await Building.findOne({
      where: { address: address },
    });
    if (existingBuilding)
      return res.status(400).send({
        message: "Invalid Address. There's already a building at this address.",
      });
    //floorsCount
    if (isNaN(floorsCount) || isNaN(parseInt(floorsCount)))
      return res.status(400).send({
        message: "Invalid Floors Count: must be a number",
      });
    if (floorsCount == null || floorsCount < 1 || floorsCount > 150)
      return res.status(400).send({ message: "Invalid Floors Count." });

    const newBuilding = {
      name,
      address,
      floorsCount,
    };

    const building = await Building.create(newBuilding);
    return res.status(201).send(building.id.toString());
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

//Update existing Building
exports.update = async (req, res) => {
  try {
    console.log("\n\n\n" + req.body + "\n\n\n");
    const { name, address, floorsCount } = req.body;

    const currentBuilding = await Building.findOne({
      where: { id: req.params.buildingId },
    });
    if (!currentBuilding) return res.status(404).send("Building not found.");

    //VALIDATIONS
    //name
    if (name == null || name.length > 30)
      return res.status(400).send({ message: "Invalid Name." });
    //address
    if (address == null || address.length > 50)
      return res.status(400).send({ message: "Invalid Address." });
    const existingBuilding = await Building.findOne({
      where: { address: address },
    });
    if (existingBuilding && address != currentBuilding.address)
      return res.status(400).send({
        message: "Invalid Address. There's already a building at this address.",
      });
    //floorsCount
    if (isNaN(floorsCount) || isNaN(parseInt(floorsCount)))
      return res.status(400).send({
        message: "Invalid Floors Count: must be a number",
      });
    if (floorsCount == null || floorsCount < 1 || floorsCount > 150)
      return res.status(400).send({ message: "Invalid Floors Count." });

    const updatedBuilding = {
      name,
      address,
      floorsCount,
    };
    if (
      (await Building.update(updatedBuilding, {
        where: { id: req.params.buildingId },
      })) != 1
    )
      return res.status(404).send("Couldn't update Building !");
    return res.status(200).send("Building successfully updated !");
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

//Delete existing Building
exports.delete = async (req, res) => {
  try {
    const currentBuilding = await Building.findOne({
      where: { id: req.params.buildingId },
    });
    if (!currentBuilding) return res.status(404).send("Building not found.");

    // Check if all offices from building are free
    let offices = {};
    offices = await Office.findAll({
      attributes: ["id"],
      where: { buildingId: req.params.buildingId },
    });

    for (let office of offices) {
      let occupiedDesks = {};
      occupiedDesks = await Desk.findAll({
        attributes: ["id"],
        where: { officeId: office.id, userId: { [Op.not]: null } },
      });
      if (occupiedDesks.length > 0)
        return res.status(400).send({
          message: "Cannot remove building: not all offices are empty",
        });
    }

    if ((await Building.destroy({ where: { id: req.params.buildingId } })) != 1)
      return res.status(404).send({ message: "Couldn't remove building." });
    return res.status(200).send({ message: "Building successfully removed !" });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

//Get all buildings
exports.findAll = async (req, res) => {
  try {
    let buildings = {};
    buildings = await Building.findAll();
    return res.status(200).send(buildings);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

//Get specific Building
exports.findOne = async (req, res) => {
  try {
    const building = await Building.findOne({
      where: { id: req.params.buildingId },
    });
    if (!building) return res.status(404).send("Building not found.");

    // Add Building metrics details
    // total no of offices
    let offices = await Office.findAll({
      where: { buildingId: req.params.buildingId },
    });
    building.dataValues.officesNo = offices.length;
    // No of total/usable/free desks from building
    let totalDesksFromB = 0;
    let totalUsableFromB = 0;
    let totalFreeFromB = 0;
    for (const office of offices) {
      //total from office
      totalDesksFromB += office.totalDesksCount;
      //usable from office
      totalUsableFromB += office.usableDesksCount;
      //free form office
      const freeDesksFromOff = await Desk.findAll({
        attributes: ["id"],
        where: { officeId: office.id, usable: true, userId: null },
      });
      totalFreeFromB += freeDesksFromOff.length;
    }
    building.dataValues.totalDesksCount = totalDesksFromB;
    building.dataValues.usableDesksCount = totalUsableFromB;
    building.dataValues.freeDesksCount = totalFreeFromB;
    //no of occupied desks from building
    let totalOccupiedFromB = totalUsableFromB - totalFreeFromB;
    building.dataValues.occupiedDesksCount = totalOccupiedFromB;
    //occupation percentage
    if (totalUsableFromB === 0) building.dataValues.occupationPercentage = 0;
    else
      building.dataValues.occupationPercentage =
        totalOccupiedFromB / totalUsableFromB;

    return res.status(200).send(building);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};
