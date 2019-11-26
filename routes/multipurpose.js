/*
* Ping router
*/

//Depnendincies
const express = require ('express');
const controller = require ('../controllers/multipurpose');

const router = express.Router ();

router.get ('/voucher/download/:token', controller.downloadVoucher);
router.get ('/logo', controller.serveLogo);

//Exporting the router
module.exports = router;
