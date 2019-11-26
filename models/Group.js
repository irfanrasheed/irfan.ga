/*
*  Group model
*/


//Dependencies
const mongoose = require('mongoose');

const groupSchema = mongoose.Schema({
	name:{
		type: String,
		minlength:2,
		maxlength:255,
		required:true
	},
	users :[
		{
			type :mongoose.SchemaTypes.ObjectId,
			ref :'User'
		}
	],
	privilages:[
		{
		name : String,
		access : [String]
	}
],
	createdBy :{
		type:mongoose.SchemaTypes.ObjectId,
		ref:'User',
		required:true
	}	
});

//Adding a user 
groupSchema.methods.addUser = async function(userId){
	if(!userId) return Promise.reject();
	if(this.users.indexOf(userId) == -1) this.users.push(userId);
	return this.save();
};

//Removing a user
groupSchema.methods.removeUser = async function(userId){
	if(userId){
	 userIndex = this.users.indexOf(userId) > -1 ? this.users.indexOf(userId) :false;
	 if(typeof userIndex == 'number'){
	  this.users.splice(userIndex,1);
	 	return this.save();
	 	}	
	 }
	
};

//Adding privilages
groupSchema.methods.addPrivilage = async function(str){
	if(!str) return Promise.reject();
	this.privilages.push(str);
	return this.save();
};

groupSchema.methods.removePrivilage = async function(str){
	str = typeof str == 'string' ? str : false;
	if(str){
	privilageIndex = this.privilages.indexOf(str) > -1 ? this.privilages.indexOf(str) :false;
	if(typeof privilageIndex == 'number'){
	  this.privilages.splice(privilageIndex,1);
	 	return this.save();
	 	}	
	}
};


groupSchema.methods.updateName = function(name){
	this.name = name;
	return this.save()
}



//export the group

module.exports = mongoose.model('Group',groupSchema);