/*
* Helper functions for different tasks
*/

//Dependencies
const crypto = require ('crypto');
const config = require ('./config');
const Mailjet = require ('node-mailjet').connect (
  config.mailjet.apiKey,
  config.mailjet.secretKey
);
const fs = require ('fs');
const path = require ('path');
const uuid = require ('uuid/v1');
const fsx = require ('fs-extra');
const puppeteer = require ('puppeteer');
//Module container
const lib = {};

lib.hash = (str, callback) => {
  return new Promise ((resolve, reject) => {
    str = typeof str == 'string' && str.length > 0 ? str : false;
    if (!str) return reject ();
    let hash = crypto
      .createHmac ('sha256', config.hashingSecret)
      .update (str)
      .digest ('hex');
    return resolve (hash);
  });
};

lib.validateEmail = str => {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!re.test (str)) return false;
  return str;
};

lib.confirmSignup = data => {
  return new Promise (function (resolve, reject) {
    data = typeof data == 'object' && Object.keys.length > 0 ? data : false;

    //@TODO  create a one time link and add it to the the data brfore interpolation
    if (!data) return reject ({error: 'missing required data object'});

    lib
      .createLink (data)
      .then (async function (link) {
        data.link = link;
        //getting the email html template
        console.log ('LANG', data.language);
        const filePath = lib.emailTemplateSelector (
          'CREATE_USER',
          data.language
        );
        try {
          let emailTemplate = await fs.readFileSync (filePath, 'utf8');
          var htmlEmail = await lib.interpolateEmail (
            data,
            'user',
            emailTemplate
          );
        } catch (e) {
          console.log (e);
          return reject ('failed to interpolate');
        }

        const emailData = {
          FromEmail: config.company.infoEmail,
          FromName: 'Breeze rentals',
          Subject: 'Account Creation completion!',
          'Html-part': htmlEmail,
          Recipients: [{Email: data.email}],
        };
        try {
          await lib.sendEmail (emailData);
          resolve ('Email sent successuffully');
        } catch (err) {
          console.log (err);
        }
      })
      .catch (err => reject (err));
  });
};

lib.sendEmail = async function (emailData) {
  return new Promise (async function (resolve, reject) {
    //emailing the user
    const sendEmail = Mailjet.post ('send', {
      url: config.mailjet.url,
      version: config.mailjet.version,
      perform_api_call: true,
    });
    try {
      await sendEmail
        .request (emailData)
        .then (res => {
          console.log (res.body);
          //@TODO do something else with the response.
          return resolve ({message: 'Email sent to the user'});
        })
        .catch (reason => {
          console.log (reason);
          reject ('Failed to send message');
        });
      return false;
    } catch (e) {
      console.log (e);
      return 'error occured during email proccessing ';
    }
  });
};

lib.bookingEmail = async function (customer) {
  return new Promise (async function (resolve, reject) {
    if (customer.toObject) customer = customer.toObject ();
    let {DateStart, DateEnd, payment, ReservationDate} = customer;
    var options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    };
    if (customer.language === 'Greek') {
      locales.push ('el-gr');
    } else if (customer.language === 'English') {
      locales.push ('en-US');
    } else if (customer.language === 'German') {
      locales.push ('de-de');
    }
    const locales = ['en-US'];
    customer.DateStart = DateStart.toLocaleDateString (locales, options);
    customer.DateEnd = DateEnd.toLocaleDateString (locales, options);
    if (payment && payment.id) customer.transactionId = payment.id;
    customer.ReservationDate = ReservationDate.toLocaleDateString (
      locales,
      options
    );
    customer.transactionId = customer.transactionId || 'N/A';
    try {
      const filePath = lib.emailTemplateSelector (
        'BOOKING_COMPLETE',
        customer.language
      );
      let emailTemplate = await fs.readFileSync (filePath, 'utf8');
      customer.origin = config.origin;
      customer.logoUrl = config.logoUrl;
      var htmlEmail = await lib.interpolateEmail (
        customer,
        'customer',
        emailTemplate
      );
    } catch (e) {
      console.log (e);
      return reject ('Failed to read or interpolate email template');
    }
    const emailData = {
      FromEmail: config.company.infoEmail,
      FromName: 'Breeze rentals',
      Subject: 'Car rental reservation complete',
      'Html-part': htmlEmail,
      Recipients: [
        {Email: customer.customeremail},
        {Email: config.company.otherEmail},
      ],
    };
    const pdfFile = customer.token + '.pdf';
    try {
      await lib.sendEmail (emailData);
      await lib.createVoucher (htmlEmail, pdfFile);
      return resolve ();
    } catch (e) {
      console.log (e);
      return reject ('failed to send booking confirmation email!');
    }
  });
};

lib.emailTemplateSelector = (emailType, language) => {
  if (emailType === 'BOOKING_COMPLETE') {
    switch (language) {
      case 'English':
        return path.join (__dirname, '/../emails/mailPayPalEnglish.html');
      case 'Greek':
        return path.join (__dirname, '/../emails/mailPayPalGreek.html');
      // case 'German':
      //   return path.join (__dirname, '/../emails/bookingComplete_German.html');
      default:
        return path.join (__dirname, '/../emails/mailPayPalEnglish.html');
    }
  } else if (emailType === 'PAYMENT_REQUEST') {
    switch (language) {
      case 'English':
        return path.join (__dirname, '/../emails/mailBankDepositEnglish.html');
      case 'Greek':
        return path.join (__dirname, '/../emails/mailBankDepositGreek.html');
      // case 'German':
      //   return path.join (__dirname, '/../bank-transfer_German.html');
      default:
        return path.join (__dirname, '/../emails/mailBankDepositEnglish.html');
    }
  } else if (emailType === 'CREATE_USER') {
    switch (language) {
      case 'English':
        return path.join (__dirname, '/../emails/createUserEnglish.html');
      case 'Greek':
        return path.join (__dirname, '/../emails/createUserGreek.html');
      // case 'German':
      //   return path.join (__dirname, '/../bank-transfer_German.html');
      default:
        return path.join (__dirname, '/../emails/createUserEnglish.html');
    }
  } else {
    return '';
  }
};

lib.interpolateEmail = function (data, objName, emailTemplate) {
  return new Promise (async function (resolve, reject) {
    //intepolate the the template
    for (var key in data) {
      if (data.hasOwnProperty (key)) {
        let find = `{${objName}.${key}}`;
        let replace = data[key];
        emailTemplate = emailTemplate.replace (new RegExp (find, 'g'), replace);
      }
    }
    resolve (emailTemplate);
  });
};

lib.createLink = function (data) {
  return new Promise (function (resolve, reject) {
    //creating a random string
    const randomString = uuid ();
    //add the activation key to disk
    lib
      .write (randomString, data)
      .then (() => {
        const link = `${config.uiOrigin}/activateuser?id=${data._id}`;
        return resolve (link);
      })
      .catch (err => reject (err));
  });
};

lib.write = function (filename, data) {
  return new Promise (function (resolve, reject) {
    filename = typeof filename == 'string' && filename.trim ().length > 0
      ? filename
      : false;
    data = typeof data == 'object' && Object.keys (data).length > 0
      ? data
      : false;
    if (!(filename && data)) return reject ('invalid input');
    //creating file path
    const filePath = path.join (
      __dirname,
      `/../activationKeys/${filename}.json`
    );
    //stringify data
    string = JSON.stringify (data);
    fs.writeFile (filePath, string, 'utf8', function (err) {
      if (!err) {
        return resolve ();
      } else {
        return reject (err);
      }
    });
  });
};

//Create a pdf voucher
lib.createVoucher = async function (html, filename) {
  const filePath = path.join (__dirname, `/../.data/vouchers/${filename}`);
  try {
    const browser = await puppeteer.launch ();
    const page = await browser.newPage ();
    await page.setContent (html);
    await page.emulateMedia ('screen');
    await page.pdf ({
      path: filePath,
      format: 'A4',
      printBackground: true,
    });
    await page.waitFor ('*');

    await browser.close ();
  } catch (e) {
    return console.log ('error: ', e);
  }
};

lib.supportEmail = data => {
  return new Promise (async (resolve, reject) => {
    if (!data) return reject ('Missing required data');
    data.origin = config.origin;
    data.logoUrl = config.logoUrl;
    try {
      let emailTemplate = await fs.readFileSync (
        path.join (__dirname, '/../emails/support.html'),
        'utf8'
      );
      var htmlEmail = await lib.interpolateEmail (
        data,
        'customer',
        emailTemplate
      );
    } catch (e) {
      console.log (e);
      return reject ('Failed to read or interpolate email template');
    }
    const emailData = {
      FromEmail: config.company.infoEmail,
      FromName: `${data.firstName} ${data.lastName}`,
      Subject: 'Customer from Breeze rentals',
      'Html-part': htmlEmail,
      Recipients: [
        {Email: config.company.infoEmail},
        {Email: config.company.otherEmail},
      ],
    };
    try {
      await lib.sendEmail (emailData);
      return resolve ();
    } catch (error) {
      console.log ('error', error);
      return reject ('failed to send support email');
    }
  });
};

//email to be sent to clients who want to pay  with bank transfer
lib.bankTransferEmail = booking => {
  return new Promise (async (resolve, reject) => {
    const filePath = lib.emailTemplateSelector (
      'PAYMENT_REQUEST',
      booking.language
    );
    let emailTemplate = await fs.readFileSync (filePath, 'utf8');
    let {DateStart, DateEnd, ReservationDate} = booking;
    var options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    };
    var locales = [];
    if (booking.language === 'Greek') {
      locales.push ('el-gr');
    } else if (booking.language === 'English') {
      locales.push ('en-US');
    } else if (booking.language === 'German') {
      locales.push ('de-de');
    }
    locales.push ('en-US');
    booking.DateStart = new Date (DateStart).toLocaleDateString (
      locales,
      options
    );
    booking.DateEnd = new Date (DateEnd).toLocaleDateString (locales, options);
    booking.ReservationDate = new Date (ReservationDate).toLocaleDateString (
      locales,
      options
    );
    booking.origin = config.origin;
    booking.logoUrl = config.logoUrl;
    console.log ('booking to intepolate', booking);
    var htmlEmail = await lib.interpolateEmail (
      booking,
      'customer',
      emailTemplate
    );
    console.log ('Bank booking email', booking.customeremail);
    const emailData = {
      FromEmail: config.company.infoEmail,
      FromName: 'Breeze rentals',
      Subject: 'Booking Payment request',
      'Html-part': htmlEmail,
      Recipients: [{Email: booking.customeremail}],
    };
    lib
      .sendEmail (emailData)
      .then (message => {
        console.log ('Bank transfer email sent successfully');
        resolve ();
      })
      .catch (err => {
        console.log (err);
        resolve ();
      });
  });
};

lib.dateFormater = (date = '', time = '', lang) => {
  if (!date) return;
  date = new Date (date);
  date = `${date.getMonth () + 1}/${date.getDate ()}/${date.getFullYear ()}`;
  console.log ('date', date);

  var locales = [];
  if (lang === 'Greek') {
    locales.push ('el-gr');
  } else if (lang === 'English') {
    locales.push ('en-US');
  } else if (lang === 'German') {
    locales.push ('de-de');
  }
  locales.push ('en-US');
  let _date = new Date (date + ' ' + time);
  var dateOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };
  // let dateTimeFormat1 = new Intl.DateTimeFormat('de', dateOptions);
  let dateString = _date.toLocaleDateString (locales, dateOptions);
  return dateString;
};

//Export the module
module.exports = lib;
