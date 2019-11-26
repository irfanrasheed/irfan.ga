/*
* Root of the application
*/

//Dependencies
require ('express-async-errors');
const logger = require ('./startup/logging');
const errors = require ('./middleware/errors');
const express = require ('express');
const mongoose = require ('mongoose');
const router = require ('./routes/index');
const frontendRouter = require ('./front/routes');
const config = require ('./lib/config');
const path = require ('path');
const productionConfig = require ('./startup/prod');
const cors = require ('cors'); //@TODO add CORS
const confirmAccount = require ('./routes/confirmAccount');
const app = express ();
app.use (express.urlencoded ({extended: true}));
//logging and handling uncaught errors
logger ();

mongoose
  .connect (config.mongoDB.uri, {useNewUrlParser: true})
  .then ((err, db) => {
    console.log ('connected to mongoDB');
  })
  .catch (e => {
    throw new Error (e);
  });

//production settings
if (config.envName == 'production') {
  productionConfig (app);
} else {
  app.use (cors ({origin: config.uiOrigin}));
}
app.use (cors ({origin: config.uiOrigin}));

//setting to JSON api
app.use (express.json ());

confirmAccount (app);

//invoking the router
router (app);

//static files
app.use (express.static (path.join (__dirname, '../client/build')));

//invoking frontend router
// frontendRouter(app);

//Captchering all Async errors
app.use (errors);

//serving the client side
app.get ('/*', function (req, res) {
  res.sendFile (path.join (__dirname, '../client/build', 'index.html'));
});

//stating the app  @TODO move this to DB connection callback
  //  app.listen(3000, function () {
  //    console.log('Example app listening on port 3000!');
  
// );


