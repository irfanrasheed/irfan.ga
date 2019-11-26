// Router fro categories

const express = require("express");
const controller = require("../controllers/categories")
const router = express.Router();


//create a group
router.post('/category/create',controller.create);
//get a group
router.get('/category/:id',controller.get);
// list of groups
router.get('/categories',controller.getAll);
//upadate group --Note updating is adding groups or users
router.put('/category/update',controller.update);
//delete group
router.delete('/category/delete/:id',controller.delete);


//exportation of the router
module.exports = router;