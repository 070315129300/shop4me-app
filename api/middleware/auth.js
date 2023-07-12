const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function(req, res, next) {
  //get token from header
  const token = req.header("Authorization");

  //Check if no token is being sent
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  //Verify token
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    req.user = decoded.vendor;
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
};
