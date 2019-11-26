/*
* Middleware for activating the user
*/


//Dependencies
const fs = require('fs');
const path = require('path');


module.exports = function(req,res,next){
    let {key} = req.query;
    console.log(key);
    key = typeof key == 'string' && key.trim().length > 0 ? key : false;
    const filePath = path.join(__dirname,`/../activationKeys/${key}.json`);
    //reading the file from disk
    try{
    const stringData = fs.readFileSync(filePath,'utf8');
    if(!stringData) return res.sendStatus(400);
    
    }catch(ex){
         return res.sendStatus(400)
    }
    try{

        // fs.unlink(filePath,function(err){
        //     if(err) return res.sendStatus(500);
        //     return next();
        // })
        next()
    }catch(err){
        console.log('failed to parse data');
        return res.sendStatus(400)
    }
}