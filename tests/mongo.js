const mongoose = require('mongoose')


mongoose.connect('mongodb://breeze:1f1femsk@cloudzeus.eu:27018/rentals',{useNewUrlParser:true}).then((err,db) => {
	console.log('connected to mongoDB');
}).catch(e => {
 throw new Error(e)
}
)
