/*
* Group Controller
*/


//Dependencies
const Group = require('../models/Group');
const User = require('../models/User');

//Container of the mdule
const lib = {};

// create a group
//require data -- name -- optional -- privilages --users
lib.createGroup = async (req,res) => {
	let { name, privilages } = req.body;
	let createdBy = req.token.id;
	name = typeof name  == 'string' && name.trim().length > 0 ? name : false;
	//@TODO get the created by from req.token
	let users = [];
	privilages = typeof privilages == 'object' && privilages instanceof Array ? privilages : [];
	if(!name)return res.status(400).send({error:'Missing required Fields'});
	if( !createdBy ) return res.status(400).send({error:'Missing required Fields'});
	let group = await Group.create({name,users,privilages,createdBy}).catch(ex=>console.log(ex));
	if(!group) return res.sendStatus(500);
	return res.status(200).send(group);	
}

//get a group
lib.getGroup = async (req,res) => {
	let {id} = req.params;
	id = typeof id == 'string' ? id :false;
	if(!id) return res.status(400).send({error:'Missing required fields'});
	let group = await Group.findOne({_id:id}).populate('users','firstName lastName email isActive').populate('createdBy','firstName lastName').exec().catch( ex => console.log(ex) ) ;
	if(!group) return res.sendStatus(404);
	return res.status(200).send(group);
}
//get a group
lib.getGroups = async (req,res) => {
	let groups = await Group.find({}).populate("createdBy","firstName lastName").exec().catch(ex => console.log(ex));
	if(!groups) return res.sendStatus(404);
	return res.status(200).send(groups);
}

//update a group
lib.updateGroup = async (req,res) => {
	let { id } = req.params;
	let { privilages,name } = req.body;
	id = typeof id  == 'string' && id.trim().length > 0 ? id : false;
	name  = typeof name  == 'string' && name.trim().length > 0 ? name : false;
	privilages = typeof privilages == 'object' && privilages instanceof Array && privilages.length > 0 ? privilages :false;
	if(!id) return res.status(400).send({error:'missing required fields'});
	if(!(name || privilages)) return res.status(400).send({error:'missing required fields to update'});
	var group = await Group.findOne({_id:id}).catch( () => console.log('failed to get groupt'));
	if(!group) return res.sendStatus(404);
	if(name) group.name = name;
	if(privilages){
		group.privilages = privilages;

	};
	Group.findOneAndUpdate({_id:id},group).then( updatedgroup => {
		return res.status(200).send(updatedgroup);
	}).catch( ex => {
		console.log(ex)
		return res.sendStatus(500)
	})
		
		
}

//for removing users or privilages
lib.editGroup = async (req,res) => {
	var {user, privilage, _id } = req.body;
	const id = typeof _id  == 'string' && _id.trim().length > 0 ? _id : false;
	email = typeof user == 'string' && user.trim().length > 0  ?  user : false;
	privilage = typeof privilage == 'string' && privilage.trim().length > 0  ? privilage :false;
	if(!id) return res.status(400).send({erro:'missing required fields'});
	if(!(email || privilage)) return res.status(400).send({error:'missing required fields to update'});
	var group = await Group.findOne({_id:id}).catch( e => console.log('Error occured will reading a user'));
	if(!group) return res.sendStatus(404);	
	if(email){
	 	//remove the group from the user
	 	let user = await User.findOne({email:email}).catch(() => console.log('failed to locate user'));
		if(!user) return res.status(404).send({error:'User not found'});
	 	await user.removeGroup(id);
	   await group.removeUser(user._id);
	 
	};
	if(privilage){
		await	group.removePrivilage(privilage);
		};
	return res.status(200).send(group);
}

//Delete a group
lib.deleteGroup = async (req,res) => {
	let id = typeof req.params.id  == 'string' && req.params.id.trim().length > 0 ? req.params.id : false;
	if(!id) return res.status(400).send({error:'missing required fields'});
	var group = await Group.findOneAndDelete({_id:id}).catch( () => console.log('failed to get use'));
	if(!group) return res.sendStatus(404); 	
	if(group.users.length == 0) return res.status(200).send(group);
	//removing the group from all the user
	for(var i=0;i<group.users.length;i++){
		let userId = group.users[i];
		let user = await  User.findOne({_id:userId});
		user.removeGroup(id);			
	};
	return res.status(200).send(group);
	
}






//Exportation of the module
module.exports = lib;
