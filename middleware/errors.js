/*
* Middleware for catpchering asyn errors
*
*/

//Dependencies
const winston = require('winston');




module.exports = function(err,req,res,next){
	//Log the exception using winston
	winston.error(err.message,err);
	
	res.status(500).send('something went wrong');
}