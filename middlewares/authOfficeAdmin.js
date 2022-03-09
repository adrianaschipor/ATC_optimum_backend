// middleware to allow actions only for Office Admins
const authOfficeAdmin = async (req, res, next) => {
  try {
    if (req.user.role != "Office Admin") {
      return res.status(403).json({
        msg: "Forbidden: only an Office Admin can perform this action",
      });
    }
    return next();
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

module.exports = authOfficeAdmin;
