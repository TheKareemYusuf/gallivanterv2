const express = require("express");
const passport = require("passport");
const bookingController = require("../controllers/bookingController");
const verifyJWT = require("./../utils/verifyJWT");

const router = express.Router();

// Create a new booking
router.route("/")
.get(
    // passport.authenticate("jwt", { session: false }), 
    verifyJWT,
    bookingController.getAllOperatorBookings
);

router.route("/:id")
.get(
    // passport.authenticate("jwt", { session: false }), 
    verifyJWT,
    bookingController.getBookingById
);

module.exports = router;