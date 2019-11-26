/*
* Car Categories desctiptions
*/


const mongoose = require('mongoose');


const categorySchema = new mongoose.Schema({
	id : {
		type:String,
		minlength:1,
		maxlength:1343435,
		required : true,
		unique : true
	},
	name : [{
		type:String,
		minlength:1,
		maxlength:10000,
		required : true,
	}],
	description :[ {
		type:String,
		minlength:1,
		maxlength:10000,
		required : true,
	}],
	thumbnail : {
		type : String,
		minlength : 1,
		required : true
	},
	gallery : [
		{
			type : String,
			minlength : 1,
			required : true
		}
	]
})


const categoryModel = mongoose.model('Category',categorySchema)


module.exports = categoryModel
