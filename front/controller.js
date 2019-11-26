/*
* Frontend Controller
*/


//Dependencies
const templating = require('./lib/templating')


async function getPage(req,res){
	if(req.method.toLowerCase() !== 'get') return res.status(402).send({error:'Method to allowed'});
	let path = req.path;
	if(path.trim().length == 1 ) path = 'login';
	var trimmedPath = path.replace('/','');
	templating.get(trimmedPath,req.query.id).then(str => {
		if(!str) res.sendStatus(500);
			res.type('html');
			res.send(str);
	}).catch(e=> res.sendStatus(500));

	
	
}







///Exportation of the function
module.exports = getPage;
