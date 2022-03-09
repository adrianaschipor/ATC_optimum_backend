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
  //  const refreshtoken = createRefreshToken({ id: user._id });
  let accessToken = jwt.sign({ user: body }, "access", {
    expiresIn: "1d",
  }); //expires in 10m
  let refreshToken = jwt.sign({ user: body }, "refresh", {
    expiresIn: "7d",
  }); //expires in 7 days
  return res
    .status(201)
    .json({ accessToken: accessToken, refreshToken: refreshToken });
};
