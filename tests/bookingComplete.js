

//DEPENDENCIES
const { bookingEmail } =require('../lib/helpers');


const customer = {
    BookingNumber : 'sxklgslkdg',
    CustomerFirstName : 'Dellan'
}

bookingEmail(customer).then( res => {

    return console.log(res)
} )
.catch(e => console.log(ex))