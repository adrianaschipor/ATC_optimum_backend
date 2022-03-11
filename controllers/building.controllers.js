const Building = require("../models/building.model");

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

    return res.status(200).send(building);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};
