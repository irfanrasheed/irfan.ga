/*
* CommandLine Tool for Admin
*/


//Dependencies
const readline = require('readline');
const {validateEmail, hash } = require('./helpers');
const User = require('../models/User');

	

async function createAdmin(){
	const rl = readline.createInterface({
			input : process.stdin,
			output : process.stdout
		});
	rl.question('name :', str => {
		var name = typeof str == 'string' && str.trim().length > 0 ? str : false
		if(!name){
			return console.log('Name cannot be empty! ');
			rl.close();
		}		
		rl.question('email : ',str => {
		let email = typeof str == 'string' && str.trim().length > 0 ? str : false
		email = validateEmail(email);
		if(!email){
		  console.log('Invalid email');
		  return rl.close();
		 }
		rl.question('password : ', async function(str){
		var password = typeof str == 'string' && str.trim().length > 0 ? str : false
		if(!password){
			console.log('Password cannot be empty! ');
			return rl.close();
		}
		let user = {
			name,
			email,
			password:hash(password),
			isAdmin:true
		}
		console.log(user);
		user = await User.create(user).catch( e => console.log(e));
		if(!user){
			 console.log('failed to create user! ');
			return  rl.close();
		}
		  console.log('User created successfully! ');
			return	rl.close();						
		})
						
		})
	})
}

createAdmin();