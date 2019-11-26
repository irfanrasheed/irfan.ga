/*
* Handler for serveral uncategorized routes
*
*/

//Dependencies
const fs = require ('fs-extra');
const path = require ('path');

//container of the module
const lib = {};

lib.downloadVoucher = async function (req, res) {
  let filename = req.params.token ? req.params.token : false;
  if (!filename)
    return res.status (400).send ({error: 'Missing required fileds'});
  filename = filename + '.pdf';
  let filePath = path.join (__dirname, `/../.data/vouchers/${filename}`);
  try {
    if (fs.existsSync (filePath)) {
      return res.download (filePath, 'voucher.pdf');
    }
  } catch (err) {
    res.sendStatus (404);
    console.error (err);
  }
};

lib.serveLogo = (req, res) => {
  let filePath = path.join (__dirname, `/../images/logo_2.svg`);
  res.sendFile (filePath);
};

//exportation of the module
module.exports = lib;
