/*
* Root router
*/


//Dependencies
const users = require('./users');
const ping = require('./ping');
const groups = require('./groups');
const multipurpose = require('./multipurpose');
//const auth = require('../middleware/auth')
const admin = require('../middleware/admin');
const logger = require('../middleware/logger');
const overview = require('./overview')
const catergories = require('./categories')
const multer = require("multer");
const path = require("path");
const reservations = require('./reservations')
const express = require('express');
//File storage..
const destination = path.join(__dirname,"/../public/uploads");

var storage = multer.diskStorage({
    destination : function (req,file,cb){
        cb(null,destination)
    },
    filename : function (req,file,cb){
        cb(null,file.fieldname + "-" + Date.now() + file.mimetype.replace('image/','.'))
    }
})
var upload = multer({storage : storage})

var cpUploads = upload.fields([{name : "gallery", maxCount : 5 },{ name : "thumbnail", maxCount : 1}])








//root router function
const rootRouter = function(app){
	app.use('/api',logger,users);
	app.use('/api',ping);
	app.use('/api',groups);//@TODO add auth
    app.use('/api',overview);
    app.use('/api',reservations)
    app.use('/api',cpUploads,catergories);
    app.use('/api/',multipurpose);

    	//adding the client
	app.use(express.static(path.join(__dirname,'/../../client/build')));

}


module.exports =  rootRouter;