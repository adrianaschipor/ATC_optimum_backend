const Sequelize = require("sequelize");
const User = require("../models/user.model");

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
      if (
        birthdayAsDate == NaN ||
        year < 1900 ||
        year > new Date().getFullYear() + 1
      )
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
    //birthday
    if (birthday != null) {
      let birthdayAsDate = new Date(birthday);
      let year = birthdayAsDate.getFullYear;
      if (
        birthdayAsDate == NaN ||
        year < 1900 ||
        year > new Date().getFullYear() + 1
      )
        return res.status(400).send({
          message: "Invalid birthday",
        });
    }
    //nationality
    if (nationality != null) {
      if (nationality.length > 30)
        return res.status(400).send({
          message: "Invalid nationality.",
        });
    }

    //treat activating/deactivating situation

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

//find all users
exports.findAll = async (req, res) => {
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
};

//find all office admins
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
