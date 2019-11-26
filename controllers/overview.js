/*
*  Overview Controller
*/

//Dependencies
// const User = require('../models/User')
const Reservation = require ('../models/Reservation');

module.exports = async function (req, res) {
  try {
    const reservations = await Reservation.find ({});
    if (!reservations) return res.sendStatus (404);
    let responsePayload = reservations.reduce (
      (accumulator, reservation) => {
        accumulator.totalRevenue += reservation.TotalCharge;
        accumulator.totalDeposit += reservation.Deposit;
        return accumulator;
      },
      {totalRevenue: 0, totalDeposit: 0}
    );

    responsePayload.totalReservations = reservations.length;
    responsePayload.totalDebtors =
      responsePayload.totalRevenue - responsePayload.totalDeposit;

    return res.status (200).send (responsePayload);
  } catch (error) {
    console.log ('error', error);
    res.sendStatus (500);
  }
};
