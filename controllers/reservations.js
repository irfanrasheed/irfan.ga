/*
* Reservation Controller
*/

//Dependencies
const Reservation = require ('../models/Reservation');
const validator = require ('../validators/reservations');
const config = require ('../lib/config');
const paypal = require ('paypal-rest-sdk');
const _data = require ('../lib/data');
const axios = require ('axios');
const {
  bookingEmail,
  supportEmail,
  confirmSignup,
  bankTransferEmail,
} = require ('../lib/helpers');
const fs = require ('fs');
const path = require ('path');
const User = require ('../models/User');

paypal.configure ({
  mode: config.envName == 'production' ? 'live' : 'sandbox',
  client_id: config.paypal.clientId,
  client_secret: config.paypal.clientSecret,
});

//Container of the mdule
const lib = {};

// pay with paypal
lib.pay = async (req, res) => {
  const booking = req.body;
  lib
    .createCustomer (booking)
    .then (() => {
      // let dataIsValid = validator(booking);
      // //information from the user
      // if(!dataIsValid) return res.status(400).send({error: "Missing required fields"});
      const filename = 'pending-booking' + booking.token;
      //change route when the payment method is bank
      if (booking.type === 'bank') {
        return lib.bankTransferByPay (booking, res);
      }
      //save the booking details temporarily before the payment is executed
      _data.create ('bookings', filename, booking, error => {
        if (error) {
          console.log (error);
          return res.sendStatus (500);
        }
        //Now making a payment request
        //----*** payment description is the booking details filename
        const createPayment = {
          intent: 'sale',
          payer: {
            payment_method: 'paypal',
          },
          redirect_urls: {
            return_url: config.paypal.returnUrl,
            cancel_url: config.paypal.cancelUrl,
          },
          transactions: [
            {
              item_list: {
                items: [
                  {
                    name: 'model-' + booking.CarModelId,
                    sku: '001',
                    price: booking.Deposit,
                    currency: 'EUR',
                    quantity: 1,
                  },
                ],
              },
              amount: {
                currency: 'EUR',
                total: booking.Deposit,
              },
              description: filename,
            },
          ],
        };
        const create_payment_json = JSON.stringify (createPayment);
        //Making a payment request to paypal
        paypal.payment.create (create_payment_json, function (error, payment) {
          if (error) {
            throw error;
          } else {
            for (let i = 0; i < payment.links.length; i++) {
              if (payment.links[i].rel === 'approval_url') {
                res.send ({link: payment.links[i].href});
              }
            }
          }
        });
      });
    })
    .catch (error => {
      console.log ('error', error);
    });
};

//the bank transfer Method
lib.bankTransferByPay = (booking, res) => {
  console.log ('creating banktranfer email');
  return lib
    .saveToBackOffice (booking)
    .then (backOffice => {
      console.log ('booking created successfully');
      console.log ('backOffice', backOffice);
      bankTransferEmail (backOffice)
        .then (() => {
          console.log ('Bank option process complete');
          return res.status (200).send ({paidThrough: 'bank'});
        })
        .catch (err => {
          console.log ('err', err);
          res.sendStatus (500);
        });
    })
    .catch (err => {
      console.log ('err', err);
      res.sendStatus (500);
    });
};


lib.banktransfer = (req,res)=> {
    const booking = req.body;
    const filename = "pending-booking" + booking.token;

    // save the booking details temporarily before the payment is executed
    _data.create('bookings',filename,booking, error => {
        _data.read('bookings',filename,(error, data) => {
            if(error){
                console.log('File read error')
                console.log(error);
                return res.sendStatus(500)
            }

            //Parse valid date
            // var tmpd = data.ReservationDate.split(',');
            // var dd = tmpd[0].split('/')[2]+'-'+tmpd[0].split('/')[1]+'-'+tmpd[0].split('/')[0] + tmpd[1];

            data.DateEnd = '2019/11/30 10:00';
            data.DateStart = '2019/11/23 10:00';
            data.ReservationDate = '2019/11/23 10:00';

            console.log("data >>>>", data);

            axios.post(config.thirdPartyEndpoints.newBooking, data).then( response => {
                const resData = response.data;
                
                // console.log("resData >>>", resData);
                //saving the reservation into the database

                let payment={id:null};
                const reservation = { ...data,...resData, payment};
                Reservation.create(reservation).then( async function(newRes){
                   //sending email to the customer informing booking completion
                   bookingEmail(newRes).then( () => {
                   return res.send({url:config.paypal.successRedirectUrl});
                   })
                   .catch( ex => {
                       console.log('failed to Send email',ex.Error)
                       return res.sendStatus(500)
                   })
                    //redirection the user back to the site
               })
               .catch( error => {
                   console.log('failed to save user to db',error);
                   return res.sendStatus(500);
               })
            })
            .catch( ex => {
                console.log('failed to book user',ex);
                return res.sendStatus(500)
            });
        });
    });
}

//Lists  all user's reservation
lib.myReservations = async (req, res) => {
  //Required data
  const {customerId} = req.params;
  if (!customerId)
    return res.status (400).send ({error: 'Missing Required Fields'});
  Reservation.find ({CustomerIdentityNumber: customerId})
    .then (resList => {
      if (!resList) return res.sendStatus (404);
      res.status (200).send (resList);
    })
    .catch (ex => {
      console.log (ex);
      res.sendStatus (500);
    });
};

//execution of payment
lib.success = async (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
  };

  paypal.payment.execute (paymentId, execute_payment_json, function (
    error,
    payment
  ) {
    if (error) {
      return console.log (error.response);
      //throw error;
    } else {
      const filename = payment.transactions[0].description;
      _data.read ('bookings', filename, (error, data) => {
        if (error) {
          console.log (error);
          return res.sendStatus (500);
        }
        lib
          .saveToBackOffice (data, payment)
          .then (() => {
            return res.redirect (config.paypal.successRedirectUrl);
          })
          .catch (err => {
            return res.sendStatus (500);
          });
      });
    }
  });
};

//save booking to backoffice
lib.saveToBackOffice = (data, payment = {}) => {
  //create a reservation at the backoffice
  return new Promise ((resolve, reject) => {
    axios
      .post (config.thirdPartyEndpoints.newBooking, data)
      .then (response => {
        const resData = response.data;
        console.log ('booking saved to backoffice');
        console.log ('resData', resData);
        //saving the reservation into the database
        var reservation = {...data, ...resData, payment};
        Reservation.create (reservation)
          .then (function (newRes) {
            newRes = newRes.toObject ();
            console.log ('res saved to db');
            console.log ('newRes', newRes);
            //Save customer to db
            User.findOne ({customeremail: newRes.customeremail})
              .then (customer => {
                if (!customer) return resolve ();
                customer.addReservation (newRes._id);
                //sending email to the customer informing booking completion
                if (newRes.paymentType == 'paypal')
                  bookingEmail (newRes)
                    .then (() => {
                      console.log ('Booking email sent');
                      // return res.redirect (config.paypal.successRedirectUrl);
                      return resolve ();
                    })
                    .catch (ex => {
                      console.log ('failed to Send email', ex.Error);
                      resolve (newRes);
                    });
                resolve (newRes);
              })
              .catch (err => {
                console.log ('err', err);
                //sending email to the customer informing booking completion
                if (customer.paymentType === 'paypal')
                  bookingEmail (newRes)
                    .then (() => {
                      // return res.redirect (config.paypal.successRedirectUrl);
                      return resolve (newRes);
                    })
                    .catch (ex => {
                      console.log ('failed to Send email', ex.Error);
                      // return res.sendStatus (500);
                      reject ();
                    });
              });

            //redirection the user back to the site
          })
          .catch (error => {
            console.log ('failed to save user to db', error);
            return reject ();
          });
      })
      .catch (ex => {
        console.log ('failed to book user', ex);
        return reject ();
      });
  });
};

lib.createCustomer = reservation => {
  return new Promise (async (resolve, reject) => {
    console.log ('Saving the customer...');
    try {
      const customer = await User.findOne ({
        email: reservation.customeremail,
      });
      if (customer) {
        console.log ('user found');
        return resolve ();
      } else {
        console.log ('No user, creating this user');
        reservation.email = reservation.customeremail; //!HACK : terrible fields naming conventions by the API designer
        delete reservation.__v;
        delete reservation._id;
        User.create ({...reservation, clearance: 'Purple'})
          .then (newCustomer => {
            //Send a 200 response althougth customer couldnt be added to db
            if (!newCustomer) return resolve ();
            console.log ('user added to db');
            confirmSignup ({
              firstName: newCustomer.CustomerFirstName,
              lastName: newCustomer.CustomerLastName,
              city: newCustomer.CustomerCity,
              email: newCustomer.customeremail,
              phone: newCustomer.CustomerPhoneNumber,
              vatNumber: 'null',
              zip: newCustomer.CustomerZipCode,
              address: newCustomer.CustomerAddress,
              _id: newCustomer._id,
              language: reservation.language,
            })
              .then (message => {
                console.log ('Customer creation confirmation email sent...');
                return resolve ();
              })
              .catch (err => {
                console.log ('error', err);
                return resolve ();
              });
          })
          .catch (err => {
            console.log (err);
            return resolve ();
          });
      }
    } catch (error) {
      console.log ('error will trying to fetch user ', customer);
      return resolve ();
    }
  });
};

//cancel paypal payment
lib.cancel = async (req, res) => {
  res.send ('Cancelled');
};

//reating a reservation
lib.create = async (req, res) => {
  let dataIsValid = validator (req.body);
  //information from the user
  if (!dataIsValid)
    return res.status (400).send ({error: 'Missing required fields'});

  Reservation.create ()
    .then (reservation => {
      return res.sendStatus (200);
    })
    .catch (error => {
      console.log (error);
      return res.sendStatus (500);
    });
};

//get a Reservation
lib.get = async (req, res) => {
  let {id} = req.params;

  id = typeof id == 'string' ? id : false;
  if (!id) return res.status (400).send ({error: 'Missing required fields'});
  try {
    let reservation = await Reservation.findOne ({token: id}).catch (ex =>
      console.log (ex)
    );
    if (!reservation) return res.sendStatus (404);
    return res.status (200).send (reservation);
  } catch (ex) {
    console.log (ex);
    return res.sendStatus (500);
  }
};
//get all reservations
lib.getAll = async (req, res) => {
  try {
    let reservations = await Reservation.find ({}).catch (ex =>
      console.log (ex)
    );
    if (!reservations) return res.sendStatus (404);
    return res.status (200).send (reservations);
  } catch (ex) {
    console.log (ex);
    return res.sendStatus (500);
  }
};
//Get reservations by customer email
lib.getByEmail = async (req, res) => {
  const email = req.params.email;
  if (!email) res.status (400).send ({error: 'Missing required fields'});
  try {
    const reservations = Reservation.find ({customeremail: email});
    if (!reservations) return res.sendStatus (500);
    return res.status (200).send (reservations);
  } catch (err) {
    console.log ('err', err);
    return res.sendStatus (500);
  }
};

//Delete a group
lib.delete = async (req, res) => {
  let id = typeof req.params.id == 'string' && req.params.id.trim ().length > 0
    ? req.params.id
    : false;
  if (!id) return res.status (400).send ({error: 'missing required fields'});
  try {
    var reservation = await Group.findOneAndDelete ({_id: id}).catch (() =>
      console.log ('failed to get use')
    );
    if (!reservation) return res.sendStatus (404);
    return res.status (200).send (reservation);
  } catch (ex) {
    console.log (ex);
    return res.sendStatus (500);
  }
};
lib.search = async (req, res) => {
  let {
    customeremail,
    BookingNumber,
    CustomerFirstName,
    CustomerLastName,
  } = req.body;
  console.log (customeremail);
  if (
    !(customeremail || BookingNumber || CustomerFirstName || CustomerLastName)
  )
    return res.status (400).send ({error: 'Missing required fields'});

  const queryCond = {};
  if (CustomerFirstName)
    queryCond.CustomerFirstName = {$regex: CustomerFirstName, $options: 'i'};
  if (CustomerLastName)
    queryCond.CustomerLastName = {$regex: CustomerLastName, $options: 'i'};
  if (customeremail) queryCond.customeremail = customeremail;
  if (BookingNumber) queryCond.BookingNumber = BookingNumber;
  console.log (queryCond);
  try {
    const reservations = await Reservation.find (queryCond);
    if (!reservations) return res.sendStatus (404);
    return res.status (200).send (reservations);
  } catch (error) {
    console.log ('error', error);
    return res.sendStatus (500);
  }
};

lib.contactSupport = (req, res) => {
  const {firstName, lastName, email, message, phone} = req.body;
  if (!(firstName && lastName && email && message && phone))
    return res.status (400).send ({error: 'Missing required Fields'});
  supportEmail ({firstName, lastName, email, message, phone})
    .then (() =>
      res.status (200).send ({message: 'Message sent successsfully'})
    )
    .catch (ex => {
      console.log ('ex', ex);
      return res.status (500).send ({error: 'Failed to send the message '});
    });
};

//Exportation of the module
module.exports = lib;
