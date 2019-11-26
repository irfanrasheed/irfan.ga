/*
* Group router
*
*/


//Dependencies
const express = require('express');
const controller = require('../controllers/groups');
const auth = require('../middleware/auth');
//router container
const router = express.Router();


//create a group
router.post('/groups/create',auth,controller.createGroup);
//get a group
router.get('/groups/:id',controller.getGroup);
// list of groups
router.get('/groups',controller.getGroups);
//upadate group --Note updating is adding groups or users
router.put('/groups/update/:id',controller.updateGroup);
//edit group Note -- editing is removing groups or users
router.put('/groups/edit',controller.editGroup);
//delete group
router.delete('/groups/delete/:id',controller.deleteGroup);


//exportation of the router
module.exports = router;