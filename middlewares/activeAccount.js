const activeAccount = async (req, res, next) => {
  try {
    if (!req.user.active) {
      return res
        .status(403)
        .json({ msg: "Forbidden: Your account is deactivated" });
    }
    return next();
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

module.exports = activeAccount;
