// const jwt = require("jsonwebtoken");

// const config = process.env;

// const verifyToken = (req, res, next) => {
//   const token =
//     req.body.token || req.query.token || req.headers["Bearer Token"];

//   if (!token) {
//     return res.status(403).json({
//       message: "A valid token is required for authentication",
//     });
//   }
//   try {
//     const decoded = jwt.verify(token, config.TOKEN_KEY);
//     req.user = decoded;
//   } catch (err) {
//     return res.status(401).send("Invalid Token");
//   }
//   return next();
// };

// module.exports = verifyToken;


const jwt = require("jsonwebtoken");
const config = process.env;

const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["authorization"];

  if (!token) {
    return res.status(403).json({
      message: "A valid token is required for authentication",
    });
  }

  try {
    // Verify the token using the TOKEN_KEY from your environment variables
    const decoded = jwt.verify(token.replace("Bearer ", ""), config.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }

  return next();
};

module.exports = verifyToken;

