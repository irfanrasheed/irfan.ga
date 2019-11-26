/*
* User router
*
*/

//Dependencies
const controller = require ('../controllers/users.js');
const express = require ('express');
const validateEmail = require ('../middleware/validateEmail');
const admin = require ('../middleware/admin');
const auth = require ('../middleware/auth');
const router = express.Router ();

//Clearance level
const {Purple} = require ('../lib/config').clearance;

router.post ('/accounts/create', validateEmail, controller.createUser);
router.post (
  '/accounts/create/customer',
  validateEmail,
  controller.createCustomer
);
router.post ('/accounts/create/confirm', controller.confirmAccountCreation);
router.put ('/accounts/update', auth (true, Purple), controller.updateUser);
router.delete (
  '/accounts/delete/:id',
  auth (true, Purple),
  admin,
  controller.deleteUser
);
router.get ('/accounts/me/:id', auth (true, Purple), controller.getUser);
router.get ('/accounts/all', auth (true, Purple), admin, controller.getUsers); //* Might change change clearance level
router.get (
  '/accounts/customers',
  auth (true, Purple),
  admin,
  controller.getCustomers
); //* Might change change clearance level
router.get ('/accounts/all', auth (true, Purple), admin, controller.getUsers);
router.post ('/accounts/login', controller.loginUser);
router.post (
  '/accounts/contact',
  auth (true, Purple),
  admin,
  controller.contactUser
);
router.post (
  '/accounts/search',
  auth (true, Purple),
  admin,
  controller.search
);
router.put (
  '/accounts/renew/token',
  auth (true, Purple),
  controller.renewToken
);

//Exporting the router
module.exports = router;
