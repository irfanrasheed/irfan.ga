/*
* All enviroments configurations
*/

//Dependencies

//Container of the module

const environments = {};

//development enviroment
environments.development = {
  envName: 'development',
  port: 7000,
  hashingSecret: 'stagingSecret',
  origin: 'http://localhost:7000',
  logoUrl: 'http://localhost:7000/api/logo',
  uiOrigin: 'http://localhost:3000', //TODO: change to 3000
  globals: {
    appName: 'carbien',
    origin: 'http://localhost:7000/',
  },
  mongoDB: {
    uri: 'mongodb://localhost/rentals',
  },
  mailjet: {
    apiKey: 'cc9338f1b66fd137f148fa19b3bdf12f',
    secretKey: '668625d63f65333235ce9a6e28d1fc02',
    url: 'api.mailjet.com',
    version: 'v3',
  },
  company: {
    infoEmail: 'info@breezerentals.gr',
    otherEmail: 'gkozyris@4ria.com',
  },
  allowedOrigins: [
    'https://breezerentals.gr',
    'http://localhost:5500',
    'http://localhost:3000',
    'https://breezecarental.gr',
    'https://reservations.breezerentals.gr',
  ],
  paypal: {
    clientId: 'AREXT6MxGWlNGTm8d-BObWS7HlGcKHxNOicbBI6nZfB8_rk5eYmFKQrkmRq7rk9vFD6Ir3C8T4E8HEEe',
    clientSecret: 'EMr4VhUaF6Ahgh7iriSH20LiwA0ir-6Bf4-xLoRozO2NqXHoSl6W55M_L4gXKPDVvHnylCsv0srGshjO',
    returnUrl: 'http://localhost:7000/api/reservations/success', //@TODO there is an issue
    cancelUrl: 'http://localhost:7000/api/reservations/cancel',
    successRedirectUrl: 'http://localhost:3000',
  },
  thirdPartyEndpoints: {
    newBooking: 'https://api.breezerentals.gr/api/Bookings/AddNewBooking',
  },
  clearance: {
    Purple: 'Purple',
    Green: 'Green',
    Yellow: 'Yellow',
  },
};

//production enviroment
environments.production = {
  envName: 'production',
  port: 8000,
  origin: 'https://breezerentals.gr',
  logoUrl: 'https://breezerentals.gr/api/logo',
  globals: {
    appName: 'carbien',
    origin: 'https://breezerentals.gr',
  },
  hashingSecret: 'prodSecret',
  mongoDB: {
    uri: 'mongodb://breeze:1f1femsk@cloudzeus.eu:27018/rentals',
  },
  mailjet: {
    apiKey: 'cc9338f1b66fd137f148fa19b3bdf12f',
    secretKey: '668625d63f65333235ce9a6e28d1fc02',
    url: 'api.mailjet.com',
    version: 'v3',
  },
  company: {
    infoEmail: 'info@breezerentals.gr',
  },
  uiOrigin: 'https://reservations.breezerentals.gr',
  allowedOrigins: [
    'https://breezerentals.gr',
    'https://breezecarental.gr',
    'https://reservations.breezerentals.gr',
  ],
  paypal: {
    clientId: 'AaRhacbRBtYEWOq0KW2DjvlNzEm3WbQnD9rCsJqN3RZ5rv6APbLpTJe4YSmB9UueEPWRQTCNOLYIetVk',
    clientSecret: 'EFfVkNwMn1JV7K2ez0Ws9lhhIHfs3LFmF9IJCma4vlkAexzCbOqXxTNFj4ga4sIhBDYCtt9Rcpjubhfg',
    returnUrl: 'https://breezerentals.gr/api/reservations/success', //@TODO there is an issue
    cancelUrl: 'https://breezerentals.gr/api/reservations/cancel',
    successRedirectUrl: 'https://breezecarental.gr',
  },
  thirdPartyEndpoints: {
    newBooking: 'https://api.breezerentals.gr/api/Bookings/AddNewBooking',
  },
  clearance: {
    Purple: 'Purple',
    Green: 'Green',
    Yellow: 'Yellow',
  },
};

//choosing an enviroment
var inputEnv = typeof process.env.NODE_ENV == 'string' &&
  process.env.NODE_ENV.trim ().length > 0
  ? process.env.NODE_ENV.trim ()
  : '';

//enviroment to export
var chosenEnv = typeof environments[inputEnv] !== 'undefined'
  ? environments[inputEnv]
  : environments.development;

//exporting environment
module.exports = chosenEnv;
