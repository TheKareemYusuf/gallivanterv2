const express = require("express");
const passport = require("passport");
const tourController = require("./../controllers/tourController");
const bookingController = require("./../controllers/bookingController");


const router = express.Router();

router.route("/").get(tourController.getAllTours)

router.route("/:tourIdOrSlug").get(tourController.getOneTour);

// router
//   .route("/joined-tours")
//   .get(
//     passport.authenticate("jwt", { session: false }),
//     tourController.getAllRegTourDetails
//   );

// router
//   .route("/joined-tours/:tourId")
//   .get(
//     passport.authenticate("jwt", { session: false }),
//     tourController.getRegTourDetails
//   );

router
.route("/profile/wishlist")
.get(
  passport.authenticate("jwt", { session: false }),
  tourController.getUserWishlistTours
);


router
  .route("/:tourIdOrSlug/book")
  .post(
    // passport.authenticate("jwt", { session: false }),
    bookingController.createBooking
  );

router
.route("/:tourIdOrSlug/wishlist")
.post(
  passport.authenticate("jwt", { session: false }),
  tourController.addToWishlist 
);

module.exports = router;
