/*
*Users Controller module
*/

//Dependencies
const User = require('../models/User');
const {hash, sendEmail} = require('../lib/helpers');
const Group = require('../models/Group');
const {confirmSignup} = require('../lib/helpers');
const path = require('path');
const fs = require('fs');
const config = require('../lib/config');
const _ = require('lodash')




//Container for the module
const lib = {};	



//@NOTE a special controller for creating users(customers) from the frontend website

lib.createCustomer = async (req,res) => {
		// destructing the request body object
		let {firstName, lastName, city, vatNumber, zip, phone, email, group, address, tel, password } = req.body;
		//Required Data 
		firstName = typeof firstName == 'string' && firstName.trim().length > 0 ? firstName.trim() :false;
		lastName = typeof lastName == 'string' && lastName.trim().length > 0 ? lastName.trim() :false;
		password = typeof password == 'string' && lastName.trim().length > 0 ? lastName.trim() :false;
		address = typeof address == 'string' && address.trim().length > 0 ? address.trim() :false;
		city = typeof city == 'string' && city.trim().length > 0 ? city.trim() :false;
		email = typeof email == 'string' && email.trim().length > 0 ? email.trim() :false;
		vatNumber = typeof vatNumber == 'string' && vatNumber.length > 0 ? vatNumber.trim() :false;
		phone = typeof phone == 'string' && phone.length > 0 ? phone :false;
		tel = typeof tel == 'string' && tel.length > 0 ? tel :false;
		zip = typeof zip == 'string' && zip.length > 0 ? zip : false;
		group = typeof group == 'string' && group.length > 0 ? group : false;
		if(!(firstName && lastName && city && email && vatNumber && phone && zip && address && group && password)) return res.status(404).send({error : "Missing required Faileds"});
		const hashedPass =  await hash(password)
		//Persisting to DB
		User.create({firstName,lastName,city,email,phone,vatNumber,zip,group,address,tel,password:hashedPass}).then( user => {
			return res.status(200).send(user);
			
		})
		.catch( ex => {
			console.log(ex);
			return res.sendStatus(500);
		})

}






//Creating a  ne user
lib.createUser = async (req,res,next) => {
	// destructing the request body object
	let {firstName,lastName,city,vatNumber,zip,phone,email,group,address,tel} = req.body;
	//Required Data
	firstName = typeof firstName == 'string' && firstName.trim().length > 0 ? firstName.trim() :false;
	lastName = typeof lastName == 'string' && lastName.trim().length > 0 ? lastName.trim() :false;
	address = typeof address == 'string' && address.trim().length > 0 ? address.trim() :false;
	city = typeof city == 'string' && city.trim().length > 0 ? city.trim() :false;
	email = typeof email == 'string' && email.trim().length > 0 ? email.trim() :false;
	vatNumber = typeof vatNumber == 'string' && vatNumber.length > 0 ? vatNumber.trim() :false;
	phone = typeof phone == 'string' && phone.length > 0 ? phone :false;
	tel = typeof tel == 'string' && tel.length > 0 ? tel :false;
	zip = typeof zip == 'string' && zip.length > 0 ? zip : false;
	group = typeof group == 'string' && group.length > 0 ? group : false;
	if(firstName && lastName && city && email && vatNumber && phone && zip && address && group){

		//@TODO send an email and the after and the save to db
		User.create({firstName,lastName,city,email,phone,vatNumber,zip,group,address,tel}).then( user => {
			const { _id } = user;
			confirmSignup({firstName,lastName,city,email,phone,vatNumber,zip,address,_id}).then( message => {
				res.status(200).send(message)
			}).catch( err => {
				console.log(err);
				res.status(400).send({error:'failed to email activation link to the user'})
			})			
		}).catch( err => {
			console.log(err);
			return res.status(500).send({error:'failed to create user'});
		})


	}else{
		res.status(400).send({error:'Missing required fields'});
	}	
};


//completing account creation
lib.confirmAccountCreation = async (req,res,next) => {
	let {password, id} = req.body;
	password = typeof password == 'string' && password.trim().length > 0 ? password : false;
	if( !(password && id )) return res.status(400).send({error:"Missing required fields"});
	const hashedPassword = await hash(password);
	User.findOneAndUpdate({_id:id },{isActive:true,password:hashedPassword}).then( user => {
		console.log('user Activated');
		return res.status(200).send({message:'user actvated '})
	})
	.catch( err => {
		console.log(err.message);
		return res.sendStatus(500);
	})

};

lib.activateUser = async (req,res) => {
	const { id } = req.query;
	if(!id) res.sendStatus(400)
	// const filePath = path.join(__dirname,'/../templates/activateUser.html');
	// const actionUrl = `${config.origin}/api/accounts/account-completion?id=${id}`
	// let stringResponse = await fs.readFileSync(filePath,'utf8');
	// stringResponse = stringResponse.replace('{origin}',config.origin)
	// stringResponse = stringResponse.replace('{actionUrl}',actionUrl);
	// res.type('html');
	// res.status(200).send(stringResponse);
	res.redirect(`${config.uiOrigin}/${id}`)

}








//Retreving a specific user
lib.getUser = async (req,res,next) => {
		//Required data
		let {id} = req.params;
		id = typeof id == 'string' && id.trim().length > 0 ? id.trim() : false;
		if(id){
			if(!(id==req.token.id ||req.token.isAdmin)) return res.sendStatus(401)
		const user = await User.findById(id).populate('reservations').lean().exec().catch( ()=> console.log('failed to get user') );
		if(!user) return res.sendStatus(404);
		const _user = _.omit(user,['password','_v'])
		res.status(200).send(_user);
		}else{
		 return	res.status(400).json({error:'Missing Required fields'})
		}
};
//Retreving a specific user
lib.getUsers = async (req,res,next) => {
		//Required data
		let users = await User.find({}).exec().catch( ()=> console.log('failed to get user') );
		if(!users) return res.sendStatus(404);
		const strippedUsers = await users.map( user =>{
			delete user.password;
			return user;
		});
		res.status(200).send(strippedUsers);

};


//Updating  user
lib.updateUser = async (req,res,next) => {
	let {_id,password} = req.body;
		if(!(_id==req.token.id || req.token.isAdmin)) return res.sendStatus(401)
	let  userUpdate = req.body
	 userUpdate = _.omit(userUpdate,['_id'])
	if(password && password.length > 0)userUpdate.password = await hash(password)

			let user = await User.findByIdAndUpdate(_id,userUpdate,{new:true});
			if(!user) return res.sendStatus(404);
			delete user.password;
			return res.status(200).send(user);
				

};



//Delete a user
lib.deleteUser = async (req,res,next) => {
		//Required data
		let {id} = req.params;
		id = typeof id == 'string' && id.trim().length > 0 ? id.trim() : false;
		if(id){
			let user = await User.findByIdAndRemove(id).catch( () => console.log("failed to get user"));
			if(!user) return res.sendStatus(404);
			res.status(200).send(user)
		}else{
		 return	res.status(400).json({error:'Missing Required fields'})
		}
};



//loging use in
lib.loginUser = async (req,res) => {
	let {email,password} = req.body;
	email = typeof email == 'string' && email.trim().length>0 ? email.trim() : false;
	password = typeof password == 'string' && password.trim().length > 0 ? password.trim() :false;
	if(!(email && password)) return res.status(400).send({error:'Missing required fields'});
	//lookup the user
	let user = await User.findOne({email:email}).populate("group").exec().catch( () => console.log('failed to find user'));
	if(!user) return res.status(400).send({error:'Incorrect user or email was entered'});
	let token = await user.authUser(email,password).catch(e=> console.log(e));
	token.user = user;
	if(!token) return res.status(400).send({error:'Incorrect user or email was entered'});
	return res.status(200).send(token);
}

lib.renewToken = async function(req,res){
	let {id} = req.token;
	if(!id) return res.sendStatus(400);
	User.findOne({_id:id}).then(user=>{
		user.renewToken().then( token => {
			res.status(200).send(token);
		}).catch(ex=> res.sendStatus(500))
	}).catch(ex => res.sendStatus(404));
	
}

lib.contactUser = async (req,res) => {
	let { customeremail,CustomerFirstName, subject,message } = req.body
	const emailData = {
		'FromEmail': config.company.infoEmail,
		'FromName': `Breezerentals`,
		'Subject': subject,
		'Html-part': `
			Good day ${CustomerFirstName}
			${message}
		`,
		'Recipients': [{'Email': customeremail }],		
	  }
	  try {
		  await sendEmail(emailData)
		  return res.sendStatus(200)
	  } catch (error) {
		  console.log(error)
		  return res.sendStatus(500)
	  }

}
lib.getCustomers = async (req,res) => {
	try {
		const customers = await User.find().lean().exec()
		_.remove(customers,cs => cs.isAdmin)
		if(!customers) return res.sendStatus(404)
		return res.status(200).send(customers)
	} catch (error) {
		console.log(error)
		return res.sendStatus(500)
	}
}

lib.search = async (req, res) => {
	let {
	  customeremail,
	  CustomerPhoneNumber,
	  CustomerFirstName,
	  CustomerLastName,
	} = req.body;
	console.log (customeremail);
	if (
	  !(customeremail || CustomerPhoneNumber || CustomerFirstName || CustomerLastName)
	)
	  return res.status (400).send ({error: 'Missing required fields'});
  
	const queryCond = {};
	if (CustomerFirstName)
	  queryCond.CustomerFirstName = {$regex: CustomerFirstName, $options: 'i'};
	if (CustomerLastName)
	  queryCond.CustomerLastName = {$regex: CustomerLastName, $options: 'i'};
	if (customeremail) queryCond.customeremail = customeremail;
	if (CustomerPhoneNumber) queryCond.CustomerPhoneNumber = CustomerPhoneNumber;
	console.log (queryCond);
	try {
	  const customers = await User.find (queryCond);
	  if (!customers) return res.sendStatus (404);
	  return res.status (200).send (customers);
	} catch (error) {
	  console.log ('error', error);
	  return res.sendStatus (500);
	}
  };
  



//Exportation of the 
module.exports = lib;