/*
* frontend routes
*/

//Dependencies
const express = require('express');
const getPage = require('./controller');
const auth = require('../middleware/auth');
//const admin = require('../middleware/admin');
const activateUser  = require('../middleware/activateUser')

const router = express.Router()

router.get('/overview',auth,getPage);
router.get('/login',getPage);
router.get('/userslist',auth,getPage);
router.get('/user',auth,getPage);  //@TODO add auth
router.get('/activateuser',activateUser,getPage);
router.get('/signup',getPage);
router.get('/groups',auth,getPage);
router.get('/group',auth,getPage);
router.get('',getPage);


 




module.exports = function root(app){
	app.use(router);
}