
const express = require('express')

const activateUser = require('../middleware/activateUser');

const accountActivationContoller = require("../controllers/users")


const activateAccountRouter = express.Router();
const confirmRouter = express.Router();

activateAccountRouter.get('/activateuser',activateUser,accountActivationContoller.activateUser)

confirmRouter.put('/accounts/account-completion',accountActivationContoller.confirmAccountCreation)

module.exports = app => {
    app.use(activateAccountRouter);
    app.use('/api',confirmRouter);
}