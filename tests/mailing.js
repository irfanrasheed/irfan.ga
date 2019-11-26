/*
* Tesing emails
*/


//dependencies
const {write,createLink,confirmSignup,interpolateEmail} = require('../lib/helpers');
const uuid = require('uuid/v1');


// //testing email template interpolation
const data = {
    firstName : 'Dellan',
    email : 'mactunechy@gmail.com',
    link : 'localhost'

}

// const filename = uuid();

// //running the test
// write(filename,data).then( template => console.log(template))
// .catch( err => console.log(err));

//testing the createLink function
confirmSignup(data).then( message => console.log(message))
.catch(err => console.log(err));

// interpolateEmail(data).then( str => console.log(str)).catch( err => console.log(err));