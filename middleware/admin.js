/*
*   Check if the user is Admin
*
*/

//Dependencies
const jwtDecoder = require ('jwt-decode');

module.exports = async function (req, res, next) {
  var token = req.token;
  if (!token.isAdmin) return res.sendStatus (403);
  next ();
};
