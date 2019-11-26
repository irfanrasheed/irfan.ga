/*
* All reservations routers
*/

//Dependencies
const express = require ('express');
const cors = require ('cors');
const controller = require ('../controllers/reservations');
const auth = require ('../middleware/auth');
const admin = require ('../middleware/admin');
//Clearance level
const {Purple} = require ('../lib/config').clearance;

const router = express.Router ();

//create a reservations
router.post ('/reservations/create', controller.create);

//make a paypal payment
router.post ('/reservations/pay', controller.pay);

//reservations bank transfer
router.post ('/reservations/banktransfer', controller.banktransfer);

//reservations creation success
router.get ('/reservations/success', controller.success);

//reservations cancel
router.get ('/reservations/cancel', controller.cancel);

//get a reservations
router.get ('/reservation/:id', controller.get);

// list of all reservations
router.get ('/reservations', auth (true, Purple), controller.getAll);

// list of users reservations
router.get (
  '/reservations/mine/:customerId',
  auth (true, Purple),
  controller.myReservations
);

//delete reservations
router.delete (
  '/reservations/delete/:id',
  auth (true, Purple),
  controller.delete
);

//contact support
router.post ('/contact-support', controller.contactSupport);

//Search a reservation
router.post ('/reservations/search', auth (true, Purple), controller.search);

//get resevations by customer email
router.get (
  '/reservations/customer-reservations/:email',
  auth (true, Purple),
  controller.getByEmail
);

//exportation of the router
module.exports = router;
