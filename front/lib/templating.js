/*
* Manipulating templates
*/

//Dependencies

const path = require('path');
const fs = require('fs');
const User = require('../../models/User');
const Group = require('../../models/Group');
const {globals} = require('../../lib/config');
 
//Container for the module
const lib = {};

lib.baseDir = path.join(__dirname,'/../templates/');

lib.get = function(path,id){
	return new Promise(async function(resolve,reject){
	path = typeof path == 'string' && path.length>0 ? path : false;
	if(!path) reject('path not a string');
	try{
		var str = await fs.readFileSync(lib.baseDir+path+'.html','utf8');
	}catch(ex){
		reject('file doesnt exist');
	}
	str = await lib.addIncludes(str).catch( e=> console.log(e));
	const data = await  lib.getData(path,id).catch(e => console.log(e));
	if(!data) return reject('not found');
	var finalString = await  lib.interpolate(path,str,data,id).catch(e => console.log(e));	
	 
	 return resolve(finalString); 
	});
}


lib.addIncludes = function(str){
	return new Promise(function(resolve,reject){
	str = typeof str == 'string' && str.length > 0 ? str :false;
	if(!str) return  reject('not a string');
	var header = fs.readFileSync(lib.baseDir+'includes/header.html','utf8');
	var footer = fs.readFileSync(lib.baseDir+'includes/footer.html','utf8');
	if(!header && !footer) return reject('failed to read includes')
	str = header + str + footer;
	//adding globals to the template;

	if(Object.keys(globals).length > 0 ){
		for(var key in globals){
			if(globals.hasOwnProperty(key)){
				var find = '{globals.'+key+'}';
				var replace = globals[key];
				str = str.replace(new RegExp(find,'g'),replace);
			}
		}
	}
	return resolve(str);	
	});
}

lib.getData = (path,id) => {
	return new Promise(async function(resolve,reject){
		let data ={};
		if(path == 'overview'){
			let users = await User.countDocuments({}).catch(ex=>console.log('failed to get number of users'));
			let groups = await Group.countDocuments({}).catch(ex=>console.log('failed to get number of groups'));
			if(!users && !groups) return reject('failed to read data');
			users = typeof users == 'number' ? users : 0;
			groups = typeof groups == 'number' ? groups : 0;
			data = {users, groups};
		}
		if(path == 'userslist'){
			let users = await User.find({}).select('name email').exec().catch(e=> console.log('an error occured'));
			if(!users) return reject('failed to find users');
			data = users;
			}
		if(path == 'groups'){
			let groups = await Group.find({}).select('name createdBy').populate('createdBy','name').exec().catch(e=> console.log('an error occured'));
			if(!groups) return reject('failed to find groups');
			data = groups;
			
		}
		if(path=='user' && typeof id == 'string' ){
			let user  = await User.findOne({_id:id}).populate('groups','name').exec().catch(e=> console.log(e));
			if(!user) return reject('failed to find user');
			data = user;
		}	
		if(path=='group' && typeof id == 'string' ){
			let group  = await Group.findOne({_id:id}).populate('createdBy','name').populate('users','name email').exec().catch(e=> console.log(e));
			if(!group) return reject('failed to find group');
			data = group;
		}
		if(path=='activateuser' && typeof id == 'string' ){
			let user  = await User.findOne({email:id}).catch(e=> console.log(e));
			if(!user) return reject('failed to find user');
			data = user;
		}
			
		return resolve(data);
			
	})
	}

lib.interpolate = function(path,str,data,id){
	return new Promise(async function(resolve,reject){
		if(path=='overview'){
			let cardsList = '';
				for(var key in data){
					if(data.hasOwnProperty(key)){
						let card = await fs.readFileSync(lib.baseDir+'snippets/card.html','utf8');
						card = card.replace('{stats}',key);
						card = card.replace('{count}',data[key]);
						cardsList+=card;
					}
				}
			str = str.replace('{cards}',cardsList)
			}

		if(path == 'userslist'){
			let usersList = '';
			if(data.length > 0 ){
				for( var i = 0; i< data.length; i++ ){
					var user = data[i].toObject();
					let  userCard = await fs.readFileSync(lib.baseDir+'snippets/userCard.html','utf8');
					for(var key in user  ){
						if(user.hasOwnProperty(key)){
							var find = '{'+key+'}';
								var replace = user[key];
								userCard = userCard.replace(find,replace);
								
					        	}
						}
					usersList += userCard;
					}
				str = str.replace('{users}',usersList);
			}else{
				str = str.replace('{groups}',"No users yet <i class='ni ni-satisfied'></i>");
			}
		}
		if(path == 'groups'){
			let groupsList = '';
			if(data.length > 0 ){
				for( var i = 0; i< data.length; i++ ){
					var group = data[i].toObject();
					let  groupCard = await fs.readFileSync(lib.baseDir+'snippets/groupCard.html','utf8');
					for(var key in group  ){
						if(group.hasOwnProperty(key)){
							if(key == 'createdBy'){
								var replace = group[key].name;
							}else{
								var replace = group[key];
							}
							var find = '{'+key+'}';
							groupCard = groupCard.replace(find,replace);
								
					        	}
						}
					groupsList += groupCard;
				}
				str = str.replace('{groups}',groupsList);
			}else{
				str = str.replace('{groups}',"No groups yet <i class='ni ni-satisfied'></i>");
			}
		}
		if(path=='user' && typeof id == 'string' ){
		 data = data.toObject();
			for(var key in data){
				if(data.hasOwnProperty(key)){
				if(key == 'groups'){
					var replace = data[key].length;
				}else{
					var replace = data[key];
				}

				var find = '{'+key+'}';
				 str = str.replace(find,replace);
					
				}
			}
		}
		if(path=='group' && typeof id == 'string'){
			data = data.toObject();
			for(var key in data){
				if(data.hasOwnProperty(key)){
				if(key == 'users'){
					var replace = data[key].length;
				}else if(key == 'createdBy'){
					var replace = data[key].name;
				}else if(key == 'privilages'){
					if(data[key].length >0){
						var replace = data[key].join(', ');
					}else{
						var replace = 'No privilages yet'
					}
				}
				else{
					var replace = data[key];
				}
				var find = '{'+key+'}';
				 str = str.replace(new RegExp(find,'g'),replace);
				}
			}
		}
		if(path=='activateuser' && typeof id == 'string'){
			data = data.toObject();
			for(var key in data){
				if(data.hasOwnProperty(key)){
				var replace = data[key];
				var find = '{'+key+'}';
				 str = str.replace(new RegExp(find,'g'),replace);
				}
			}
		}

		return resolve(str);
		
	});
}





///Exportation of the module
module.exports = lib;