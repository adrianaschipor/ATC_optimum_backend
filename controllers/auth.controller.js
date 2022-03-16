const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/user.model");

// Login controller
exports.login = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (!user) {
      return res
        .status(403)
        .send({ accessToken: null, message: "Email not found " });
    }

    // ! be careful to change this when adding bcrypt for password
    if (user.password != req.body.password) {
      return res.status(401).send({
        accessToken: null,
        message: "Invalid Password!",
      });
    }

    // Check if user acount is deactivated
    if (!user.active)
      return res.status(403).send({
        accessToken: null,
        message: "Your account is deactivated.",
      });

    // user data that will be sent to frontend
    const tokenUser = { id: user.id, role: user.role, active: user.active };
    let accessToken = jwt.sign(tokenUser, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1d",
    });
    let refreshToken = jwt.sign(tokenUser, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });
    return res.status(201).json({
      accessToken: accessToken,
      refreshToken: refreshToken,
      role: user.role,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// Refresh token controller - used when access token expires
exports.refreshToken = (req, res) => {
  try {
    const refreshToken = req.cookies.refresh;
    if (!refreshToken)
      return res.status(403).json({ msg: "You must log in or register" });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err)
        return res.status(403).json({ msg: "You must log in or register" });

      const tokenUser = { id: user.id, role: user.role, active: user.active };
      const accessToken = jwt.sign(tokenUser, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });

      return res.status(201).json({ accessToken: accessToken });
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
