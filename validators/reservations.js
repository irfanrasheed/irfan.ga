/*
* Validation of data from users
*/

//Dependencies
const Joi = require('joi');

const schema = Joi.object().keys({
    //Booking details
    FromBranchStoreId :Joi.number().required(),
    ToBranchStoreId : Joi.number().required(),
    CarCategoryId : Joi.number().required(),
    CarModelId : Joi.number().required(),
    DateStart :Joi.string().min(1).max(1000).required(),
    DateEnd :Joi.string().min(1).max(1000).required(),
    DaysRental :Joi.number().min(1).required(),
    ReservationDate : Joi.string().min(1).max(1000).required(),
    TotalPrice : Joi.number().min(1).required(),
    PlaceFrom : Joi.string().min(1).max(255).required(),
    PlaceTo : Joi.string().min(1).max(255).required(),
    Notes : Joi.string().min(1).max(1000).required(),
    //Customers Details
    CustomerAddress:Joi.string().min(1).max(255).required(),
    CustomerCity: Joi.string().min(1).max(255).required(),
    CustomerFirstName: Joi.string().min(1).max(255).required(),
    CustomerIdentityNumber: Joi.string().min(1).max(255).required(),
    CustomerLastName: Joi.string().min(1).max(255).required(),
    CustomerLicense: Joi.string().min(1).max(255).required(),
    CustomerPhoneNumber: Joi.string().min(1).max(255).required(),
    CustomerZipCode: Joi.string().min(1).max(255).required(),
    customeremail: Joi.string().min(1).max(255).required(),
    paymentType: Joi.string().min(1).max(255).required(),
    //Booking details
    BookingNumber: Joi.string().min(1).max(255).required(),
    CarCategory: Joi.string().min(1).max(255).required(),
    CarModel: Joi.string().min(1).max(255).required(),
    CustomerId: Joi.number().min(1).required(),
    Message: Joi.string().min(1).max(255).required(),
    Success: Joi.boolean().required(),
    TotalBookingCost:  Joi.number().min(1).required(),

})

function validator(data){
    data = data instanceof Object && data != null ? data : false;
    if(!data) return false;
    //validate using joi validator
    const results =  Joi.validate(data,schema)
    //console.log(results.error)
    console.log("results.error >>>>>>>>>>>>>>>>>", results.error);
    return results.error === null ? true : false;
    
}


module.exports = validator;