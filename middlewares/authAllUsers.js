const authAllUsers = async (req, res, next) => {
  try {
    if (
      req.user.role != "Office Admin" &&
      req.user.role != "Admin" &&
      req.user.role != "Employee"
    ) {
      return res
        .status(403)
        .json({ msg: "Forbidden: Application doesn't recognize your role" });
    }
    return next();
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

module.exports = authAllUsers;
