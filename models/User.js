/*
* User model
*/

//Dependencies
const mongoose = require ('mongoose');
const {hash} = require ('../lib/helpers');
const config = require ('../lib/config');
const jwt = require ('jsonwebtoken');
//Users Schema
const userSchema = new mongoose.Schema ({
  //Customer details
  CustomerAddress: {
    type: String,
  },
  CustomerCity: {
    type: String,
  },
  CustomerFirstName: {
    type: String,
  },
  CustomerIdentityNumber: {
    type: String,
  },
  CustomerLastName: {
    type: String,
  },
  CustomerLicense: {
    type: String,
  },
  CustomerPhoneNumber: {
    type: String,
  },
  CustomerZipCode: {
    type: String,
  },
  customeremail: {
    type: String,
  },
  firstName: {
    type: String,
    minlength: 1,
    maxlength: 255,
  },
  lastName: {
    type: String,
    minlength: 1,
    maxlength: 255,
  },
  email: {
    type: String,

    unique: true,
  },
  reservations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
    },
  ],
  password: {
    type: String,
    maxlength: 1000,
  },
  isAdmin: {
    type: Boolean,
  },
  isActive: {
    type: Boolean,
  },
  clearance: {
    type: String,
  },
});

userSchema.methods.authUser = async function (email, password) {
  let inputPassword = await hash (password);
  if (this.password !== inputPassword) return false;
  if (this.email !== email) return false;
  let token = await jwt.sign (
    {
      id: this._id,
      isAdmin: this.isAdmin,
      firstName: this.firstName,
      clearance: this.clearance,
    },
    config.hashingSecret,
    {expiresIn: '1h'}
  );
  return {token};
};

userSchema.methods.renewToken = async function () {
  let token = jwt.sign (
    {id: this._id, groups: this.groups, isAdmin: this.isAdmin},
    config.hashingSecret,
    {expiresIn: '1h'}
  );
  return {token};
};

userSchema.methods.addReservation = function (id) {
  this.reservations = [...this.reservations, id];
  return this.save ();
};

//User Model
const User = mongoose.model ('User', userSchema);

//Exporting the Model
module.exports = User;
