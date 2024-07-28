const express = require("express");
const passport = require("passport");
const bookingController = require("../controllers/bookingController");
const BookingValidationMW = require("../validators/booking.validation");

const router = express.Router();

// Create a new booking
router.route("/")
.post(
    BookingValidationMW,
    // passport.authenticate("jwt", { session: false }), 
    bookingController.createBooking
).get(
    passport.authenticate("jwt", { session: false }), 
    bookingController.getAllUserBookings
);

router.route("/:id")
.get(
    passport.authenticate("jwt", { session: false }), 
    bookingController.getBookingById
).put(
    passport.authenticate("jwt", { session: false }), 
    bookingController.updateBooking
).delete(
    passport.authenticate("jwt", { session: false }), 
    bookingController.deleteBooking
).patch(
    passport.authenticate("jwt", { session: false }), 
    bookingController.cancelBooking
);


module.exports = router;