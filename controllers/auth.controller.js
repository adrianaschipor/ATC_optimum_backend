const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

exports.login = async (req, res) => {
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

  if (user.password != req.body.password) {
    return res.status(401).send({
      accessToken: null,
      message: "Invalid Password!",
    });
  }

  let body = { id: user.id, email: user.email, role: user.role };
  let accessToken = jwt.sign({ user: body }, "access", {
    expiresIn: "1d",
  });
  let refreshToken = jwt.sign({ user: body }, "refresh", {
    expiresIn: "7d",
  });
  return res
    .status(201)
    .json({ accessToken: accessToken, refreshToken: refreshToken });
};

exports.refreshToken = (req, res) => {
  try {
    const refreshToken = req.cookies.refresh;
    if (!refreshToken)
      return res.status(403).json({ msg: "You must log in or register" });

    jwt.verify(refreshToken, "refresh", (err, user) => {
      if (err)
        return res.status(403).json({ msg: "You must log in or register" });

      console.log("\n\n\n\n" + user);
      const accessToken = jwt.sign({ user }, "access", {
        expiresIn: "1d",
      });

      return res.status(201).json({ accessToken: accessToken });
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
