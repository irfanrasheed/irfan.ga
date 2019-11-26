/*
*   Logging Errors
*/

//Dependencies
const config = require('../lib/config');
const winston = require('winston');
require('winston-mongodb');



module.exports = function(){


//subscribing to the uncaughtException event
winston.handleExceptions(new winston.transports.File({filename:'unhandledExceptions.log'}));

process.on('unhandledRejections', ex => {
	throw ex;
})

//adding a logging errors file transport
winston.add(new winston.transports.Console({format:winston.format.json()}));

//loging to MongoDB in production
// if(config.envName == 'production'){
//   winston.add(winston.transports.MongoDB,{db:config.mongoDB.uri,level:'info'});
//   winston.add(new winston.transports.File({filename:'logFile.log',format:winston.format.json()}));
// }

	
}

