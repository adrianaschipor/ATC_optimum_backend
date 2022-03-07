const Office = require("../models/office.model");
const Building = require("../models/building.model");
const User = require("../models/user.model");

//Create new Building
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
    if (width < 1 || width > 500)
      return res.status(400).send({ message: "Invalid Width." });
    //length
    if (length < 1 || length > 500)
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
    return res.status(201).send(office.id.toString());
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};
