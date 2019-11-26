/*
* Validate email when signing up
*
*/


//Dependencies


function validateEmail(req,res,next){
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if( !re.test(req.body.email) ) return res.status(400).send({error:"email not valid"});
	next();
}


//export the module
module.exports = validateEmail;