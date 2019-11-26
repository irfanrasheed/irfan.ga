/*
* Ping router
*/

//Depnendincies
const express = require('express');


const router = express.Router();

router.get('/ping',(req,res,next) => {
	res.send('Server is up');
});







//Exporting the router
module.exports = router;