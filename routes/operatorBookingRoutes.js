const express = require("express");
const passport = require("passport");
const bookingController = require("../controllers/bookingController");

const router = express.Router();

// Create a new booking
router.route("/")
.get(
    passport.authenticate("jwt", { session: false }), 
    bookingController.getAllOperatorBookings
);

router.route("/:id")
.get(
    passport.authenticate("jwt", { session: false }), 
    bookingController.getBookingById
);

module.exports = router;