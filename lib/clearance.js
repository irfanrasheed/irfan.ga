/**
 * List of routes and their clearanvce levels
 * 
 */

 //Dependances
 
//module container
const lib = {};

//users Model
lib.users = {
    create :['Purple'],
    readAll : ['Purple','Green'],
    readOne : ['Purple','Green','Yellow'],
    deleteOne : ['Purple']
}
//users Model
lib.reservations = {
    create : ['Purple','Green','Yellow'],
    readAll : ['Purple','Green'],
    readOne : ['Purple','Green','Yellow'],
    deleteOne : ['Purple']
}

module.exports = lib;