/*
*  Re model
*/


//Dependencies
const mongoose = require('mongoose');

const reservationSchema = mongoose.Schema({
	//Customer details
	CustomerAddress: {
		type : String,
		required : true
	},
	CustomerCity: {
		type : String,
		required : true
	},
	CustomerFirstName: {
		type : String,
		required : true
	},
	CustomerIdentityNumber:{
		type : String,
		required : true
	},
	CustomerLastName:{
		type : String,
		required : true
	},
	CustomerLicense:{
		type : String,
		required : true
	},
	CustomerPhoneNumber:{
		type : String,
		required : true
	},
	CustomerZipCode: {
		type : String,
		required : true
	},
	customeremail:{
		type : String,
		required : true
	},
	paymentType:{
		type : String,
		required : true
	},
	//Booking Details
	FromBranchStoreId :{
		type:Number,
		required :true
	}, 
	ToBranchStoreId :{
		type:Number,
		required :true
	},
	CarCategoryId : {
		type:Number,
		required :true
	},
	CarModelId : {
		type:Number,
		required :true
	},
	CarMake : {
		type:String,
		required :true
	},
	DateStart :{
		type:Date,
		required :true
	},
	DateEnd :{
		type:Date,
		required :true
	},
	DaysRental:{
		type:Number,
		required :true
	},
	ReservationDate :{
		type:Date,
		required :true
	},
	Deposit :{
		type:Number,
		required :true
	},
	PlaceFrom:{
		type:String,
		required :true
	},
	PlaceTo :{
		type:String,
		required :true
	},
	Notes : {
		type:String,
	},
	//Reservation details
	BookingNumber: {
		type:String,
		required :true
	},
	CarCategory: {
		type:String,
		required :true
	},
	CarModel: {
		type:String,
		required :true
	},
	CustomerId: {
		type:Number,
		required :true
	},
	Message: {
		type:String,
		required :true
	},
	Success: {
		type:Boolean,
		required :true
	},
	TotalCharge: {
		type:Number,
		required :true
	},
	Balance: {
		type:Number,
		required :true
	},
	AveDailyCharge: {
		type:Number,
		required :true
	},
	
	ExtraCharges: {
		type:Number,
		required :true
	},
	
	token: {
		type:String,
		required :true
	},
	payment: {
		type:Object,
		required :true
	}
});




//export the group

module.exports = mongoose.model('Reservation',reservationSchema);