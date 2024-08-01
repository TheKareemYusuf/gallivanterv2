const express = require("express");
const passport = require("passport");
const bookingController = require("../controllers/bookingController");
const BookingValidationMW = require("../validators/booking.validation");
const verifyJWT = require("./../utils/verifyJWT");

const router = express.Router();

// Create a new booking
router.route("/")
.post(
    BookingValidationMW,
    // passport.authenticate("jwt", { session: false }), 
    bookingController.createBooking
).get(
    // passport.authenticate("jwt", { session: false }),
    verifyJWT, 
    bookingController.getAllUserBookings
);

router.route("/:id")
.get(
    // passport.authenticate("jwt", { session: false }), 
    verifyJWT,
    bookingController.getBookingById
).put(
    // passport.authenticate("jwt", { session: false }), 
    verifyJWT,
    bookingController.updateBooking
).delete(
    // passport.authenticate("jwt", { session: false }), 
    verifyJWT,
    bookingController.deleteBooking
).patch(
    // passport.authenticate("jwt", { session: false }), 
    verifyJWT,
    bookingController.cancelBooking
);


module.exports = router;