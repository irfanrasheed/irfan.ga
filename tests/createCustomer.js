const {createCustomer} = require ('../controllers/reservations');

const mongoose = require ('mongoose');
const config = require ('../lib/config');

(async () => {
  const res = {
    CustomerFirstName: 'Dellan',
    CustomerLastName: 'gdsgd',
    customeremail: 'mactunechy@gmail.com',
    CustomerZipCode: '8908908',
    CustomerCity: 'harrare',
    CustomerAddress: 'hello world',
    CustomerLicense: 'bvnvnv',
    CustomerIdentityNumber: 'nvbnvbn',
    CustomerPhoneNumber: '54695464569',
    tosAgreement: true,
    loading: false,
    paymentType: 'paypal',
    token: '58563460-bc79-11e9-aeeb-dd1e1ab32197',
    CarMake: 'VOLKSWAGEN',
    CarModel: 'NEW POLO',
    CarModelId: 149,
    CarCategory: 'ECONOMY',
    CarCategoryId: 90,
    CarEquipment: null,
    ExtraDriver: false,
    DriverRequirements: null,
    Quantity: 0,
    PriceWithoutExtras: [[Object]],
    totalCharges: 80,
    AveDailyCharge: '80.00',
    Deposit: '80.00',
    Balance: '0.00',
    Notes: 'Baby Seat ; ',
    ReservationDate: '8/11/2019, 10:48:17 PM',
    ExtraCharges: 5,
    PlaceTo: 'Piraeus Port',
    PlaceFrom: 'Piraeus Port',
    DaysRental: 1,
    DateStart: '2019-08-15T20:47:00.000Z',
    DateEnd: '2019-08-16T20:47:00.000Z',
    TotalCharge: 80,
    FromBranchStoreId: 6,
    ToBranchStoreId: 6,
  };
  mongoose
    .connect (config.mongoDB.uri, {useNewUrlParser: true})
    .then (async (err, db) => {
      console.log ('connected to mongoDB');
      await createCustomer (res);
    })
    .catch (e => {
      throw new Error (e);
    });
}) ();
