// const express = require("express");
// const passport = require("passport");
// const tourController = require("./../controllers/tourController");

// const router = express.Router();

// router.route("/").get(tourController.getAllPublicTours)

// router.route("/:tourId").get(tourController.getAPublicTour);

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

// router
// .route("/wishlist")
// .get(
//   passport.authenticate("jwt", { session: false }),
//   tourController.getAllWishlist
// );

// router
// .route("/wishlist/:tourId")
// .get(
//   passport.authenticate("jwt", { session: false }),
//   tourController.getWishlistTour
// );

// router
//   .route("/:tourId/join")
//   .post(
//     passport.authenticate("jwt", { session: false }),
//     tourController.joinATour
//   );

// router
// .route("/:tourId/wishlist")
// .post(
//   passport.authenticate("jwt", { session: false }),
//   tourController.addToWishList
// );
// module.exports = router;
