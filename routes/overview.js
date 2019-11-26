/*
* Router of the overview Endpoint
*/

//Dependencies
const express = require ('express');
const controller = require ('../controllers/overview');
const router = express.Router ();
const admin = require ('../middleware/admin');
const auth = require ('../middleware/auth');
//Clearance level
const {Purple} = require ('../lib/config').clearance;
router.get ('/overview', auth (true, Purple), admin, controller);

//export the router
module.exports = router;
