/*
*   Prodaction setting  middleware
*/

//Dependencies
const cors = require ('cors');
const config = require ('../lib/config');
const helmet = require ('helmet');
const compression = require ('compression');
module.exports = function (app) {
  app.use (
    cors ({
      origin: function (origin, callback) {
        // allow requests with no origin
        // (like mobile apps or curl requests)
        if (!origin) return callback (null, true);
        console.log ('origin', origin);
        if (config.allowedOrigins.indexOf (origin) > -1)
          return callback (null, true);
        var msg =
          'The CORS policy for this site does not ' +
          'allow access from the specified Origin.';
        return callback (new Error (msg), false);
      },
    })
  );

  //sercure from web vulnerabilities
  app.use (helmet ());

  //Compression middleware
  app.use (compression ());
};
