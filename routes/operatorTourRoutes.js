const express = require("express");
const passport = require("passport");
const tourController = require("../controllers/tourController");
const TourValidationMW = require("../validators/tour.validation");
const restrictToMW = require("../authentication/restrictionHandler");
const verifyJWT = require("./../utils/verifyJWT");

// const itineraryController = require("../controllers/itineraryController");

const router = express.Router();



router
  .route("/")
  .get(
    // passport.authenticate("jwt", { session: false }),
    verifyJWT,
    tourController.getOperatourTours
  )
  .post(
    TourValidationMW,
    // passport.authenticate("jwt", { session: false }),
    verifyJWT,
    tourController.createTour
  );




// router
//   .route("/members")
//   .get(
//     passport.authenticate("jwt", { session: false }),
//     tourController.getCreatorToursRegMembers
//   );

// router
//   .route("/images")
//   .post(
//     // passport.authenticate("jwt", { session: false }),
//     tourController.uploadMultiplePictures,
//     tourController.uploadImages
//   )
//   .delete(tourController.deleteImage);

router
  .route("/:tourIdOrSlug")
  .get(
    // passport.authenticate("jwt", { session: false }),
    verifyJWT,
    tourController.getAOperatorTour
  )
  .put(
    // passport.authenticate("jwt", { session: false }),
    verifyJWT,
    tourController.updateTour
  )
  .patch(
    // passport.authenticate("jwt", { session: false }),
    verifyJWT,
    tourController.updateTourState
  )
  .delete(
    // passport.authenticate("jwt", { session: false }),
    verifyJWT,
    restrictToMW.restrictTo("admin"),
    tourController.deleteTour
  );

// router
//   .route("/:tourId/members")
//   .get(
//     passport.authenticate("jwt", { session: false }),
//     tourController.getTourRegMembers
//   );



router
  .route("/:tourId/upload-images")
  .patch(
    // passport.authenticate("jwt", { session: false }),
    verifyJWT,
    tourController.uploadMultiplePictures,
    tourController.addImages
  );

router.route("/dashboard/get-average-ratings")
  .get(
      // passport.authenticate("jwt", { session: false }),
      verifyJWT,
      tourController.getAverageTourRatings
  )


module.exports = router;
