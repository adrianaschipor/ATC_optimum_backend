const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const User = require("../models/user.model");
const Desk = require("../models/desk.model");
const Office = require("../models/office.model");
const Building = require("../models/building.model");
const RemoteReq = require("../models/remoteReq.model");

// Controller used when adding a new user
exports.create = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      password,
      role,
      gender,
      birthday,
      nationality,
    } = req.body;

    //VALIDATIONS
    //name
    if (firstname == null || firstname.length > 30) {
      return res.status(400).send({ message: "Invalid first name." });
    }
    if (lastname == null || lastname.length > 30) {
      return res.status(400).send({ message: "Invalid last name." });
    }
    //email
    const emailExists = await User.findOne({
      where: { email: email },
    });
    if (emailExists)
      return res.status(400).json({ msg: "This email is already used" });
    var regex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
    if (!regex.test(email) || email.length > 50) {
      return res.status(400).send({ message: "Invalid email format" });
    }
    //password
    var regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!regex.test(password)) {
      return res.status(400).json({
        msg: "Invalid password. Minimum 8 characters, at least one letter, one number and one special character",
      });
    }
    //role
    if (role != "Admin" && role != "Office Admin" && role != "Employee")
      return res.status(400).send({
        message:
          "Invalid role. Available roles are: Admin, Office Admin and Employee.",
      });
    //gender
    if (gender != "Male" && gender != "Female" && gender != "Other")
      return res.status(400).send({
        message: "Invalid gender.",
      });
    //birthday - not mandatory
    if (birthday != null) {
      let birthdayAsDate = new Date(birthday);
      let year = birthdayAsDate.getFullYear;
      if (birthdayAsDate == NaN || year < 1900 || birthdayAsDate > new Date())
        return res.status(400).send({
          message: "Invalid birthday",
        });
    }
    //nationality - not mandatory
    if (nationality != null) {
      if (nationality.length > 30)
        return res.status(400).send({
          message: "Invalid nationality.",
        });
    }

    // !! To add: bcrypt for password

    const newUser = {
      firstname,
      lastname,
      email,
      password,
      role,
      gender,
      birthday,
      nationality,
      // when created, the user is active by default
      active: true,
    };

    const user = await User.create(newUser);
    return res.status(201).send(user.id.toString());
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

// Controller used when an user is updated, activate/deactivate is also treated here
exports.update = async (req, res) => {
  try {
    const currentUser = await User.findOne({
      where: { id: req.params.userId },
    });
    if (!currentUser) return res.status(404).send("User not found.");

    const {
      firstname,
      lastname,
      email,
      password,
      role,
      gender,
      birthday,
      nationality,
      active,
    } = req.body;

    //VALIDATIONS
    //name
    if (firstname == null || firstname.length > 30) {
      return res.status(400).send({ message: "Invalid first name." });
    }
    if (lastname == null || lastname.length > 30) {
      return res.status(400).send({ message: "Invalid last name." });
    }
    //email
    const emailExists = await User.findOne({
      where: { email: email },
    });
    if (emailExists && email != currentUser.email)
      return res.status(400).json({ msg: "This email is already used" });
    var regex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
    if (!regex.test(email) || email.length > 50) {
      return res.status(400).send({ message: "Invalid email format" });
    }
    //password
    var regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!regex.test(password)) {
      return res.status(400).json({
        msg: "Invalid password. Minimum 8 characters, at least one letter, one number and one special character",
      });
    }
    //role
    if (role != "Admin" && role != "Office Admin" && role != "Employee")
      return res.status(400).send({
        message:
          "Invalid role. Available roles are: Admin, Office Admin and Employee.",
      });
    //gender
    if (gender != "Male" && gender != "Female" && gender != "Other")
      return res.status(400).send({
        message: "Invalid gender.",
      });
    //birthday - not mandatory
    if (birthday != null) {
      let birthdayAsDate = new Date(birthday);
      let year = birthdayAsDate.getFullYear;
      if (birthdayAsDate == NaN || year < 1900 || birthdayAsDate > new Date())
        return res.status(400).send({
          message: "Invalid birthday",
        });
    }
    //nationality - not mandatory
    if (nationality != null) {
      if (nationality.length > 30)
        return res.status(400).send({
          message: "Invalid nationality.",
        });
    }

    //treat deactivating account situation
    if (!active) {
      // prevent admin from deactivating his own account
      if (currentUser.id === req.user.id)
        return res.status(400).send({
          message: "You're not allowed to deactivate your own account",
        });
      // remove the assigned desk of deactivated user
      let desk = await Desk.findOne({ where: { userId: req.params.userId } });
      if (desk) {
        desk.userId = null;
        await desk.save();
      }
    }

    const updatedUser = {
      firstname,
      lastname,
      email,
      password,
      role,
      gender,
      birthday,
      nationality,
      active,
    };

    if (
      (await User.update(updatedUser, {
        where: { id: req.params.userId },
      })) != 1
    )
      return res.status(404).send("Couldn't update User!");
    return res.status(200).send("User updated successfully !");
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

// controller that returns all users based on name search
exports.findAllByName = async (req, res) => {
  try {
    let users = {};
    const substr = "%" + req.params.name + "%";
    if (req.user.role === "Admin") {
      // Admins have access to more information than other users
      users = await User.findAll({
        attributes: [
          "id",
          "firstname",
          "lastname",
          "email",
          "role",
          "gender",
          "birthday",
          "nationality",
          "active",
        ],
        where: {
          [Op.or]: [
            { firstname: { [Op.like]: substr } },
            { lastname: { [Op.like]: substr } },
          ],
        },
      });
    } else {
      users = await User.findAll({
        attributes: ["id", "firstname", "lastname"],
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                { firstname: { [Op.like]: substr } },
                { lastname: { [Op.like]: substr } },
              ],
            },
            // usual user shouldn't be able to see deactivated accounts
            { active: true },
          ],
        },
      });
    }

    // Add info about building, office and remote working for every user
    for (let user of users) {
      // search for office and building info
      const desk = await Desk.findOne({
        attributes: ["id", "officeId"],
        where: { userId: user.id },
      });
      if (desk) {
        const office = await Office.findOne({
          attributes: ["id", "name", "buildingId"],
          where: { id: desk.officeId },
        });
        if (office) {
          // add info about office
          user.dataValues.officeId = office.id;
          user.dataValues.officeName = office.name;
          const building = await Building.findOne({
            attributes: ["id", "name"],
          });
          if (building) {
            //add info about building
            user.dataValues.buildingId = building.id;
            user.dataValues.buildingName = building.name;
          }
        }
      }
      // search for remote info
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1; //the +1 converts the month from digital (0-11) to normal.
      const workingRemote = await RemoteReq.findOne({
        attributes: ["percentage"],
        where: {
          [Op.and]: [
            { userId: user.id },
            { status: "Approved" },
            { year: currentYear },
            { month: currentMonth },
          ],
        },
      });
      // add remote info
      if (workingRemote) {
        if (workingRemote.percentage === 100)
          user.dataValues.remoteStatus = "fully remote";
        else {
          user.dataValues.remoteStatus = "partially remote";
          user.dataValues.remotePercentage = workingRemote.percentage;
        }
      } else {
        user.dataValues.remoteStatus = "NO";
      }
    }

    return res.status(200).send(users);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

// Controller that returns all office admins
exports.findAllOfficeAdmins = async (req, res) => {
  try {
    let officeAdmins = {};
    officeAdmins = await User.findAll({
      where: { role: "Office Admin" },
    });

    for (const user of officeAdmins) {
      //set birthday to string
      user.dataValues.birthday = new Date(
        user.dataValues.birthday
      ).toDateString();
      //remove password
      delete user.dataValues.password;
    }
    return res.status(200).send(officeAdmins);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

//find all users !! NOT needed -> included in findAllByName, no substring introduced situation
/*exports.findAll = async (req, res) => {
  try {
    let users = {};
    users = await User.findAll();

    for (const user of users) {
      //set birthday to string
      user.dataValues.birthday = new Date(
        user.dataValues.birthday
      ).toDateString();
      //remove password
      delete user.dataValues.password;
    }
    return res.status(200).send(users);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};*/
