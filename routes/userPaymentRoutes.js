const express = require('express');
const passport = require('passport');
const paymentController = require('../controllers/paymentController');
const verifyJWT = require("./../utils/verifyJWT");


const router = express.Router();

router.route("/verify-payment")
.post(
    // passport.authenticate("jwt", { session: false }), 
    // verifyJWT,
    paymentController.verifyPayment
);

router.route("/webhook")
.post(
    paymentController.paymentWebhook
);


module.exports = router;


