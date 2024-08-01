const express = require("express");
const passport = require("passport");
const reviewController = require("../controllers/reviewController");
const ReviewValidationMW = require("../validators/review.validation");
const verifyJWT = require("./../utils/verifyJWT");

const router = express.Router();


router.route("/tour/:tourIdOrSlug")
.post(
    // passport.authenticate("jwt", { session: false }),
    verifyJWT,
    ReviewValidationMW,
    reviewController.createReview
).get(
    // passport.authenticate("jwt", { session: false }),
    verifyJWT,
    reviewController.getAllReviewsByTour
)

router.route("/")
    .get(
        // passport.authenticate("jwt", { session: false }),
        verifyJWT,
        reviewController.getAllReviewsByUser
    );


router.route("/:reviewId")
    .get(
        // passport.authenticate("jwt", { session: false }),
        verifyJWT,
        reviewController.getOneReview
    )
    .put(
        // passport.authenticate("jwt", { session: false }),
        verifyJWT,
        reviewController.updateReview
    )
    .delete(
        // passport.authenticate("jwt", { session: false }),
        verifyJWT,
        reviewController.deleteReview
    )

router.route("/company/:companyName")
    .get(
        // passport.authenticate("jwt", { session: false }),
        verifyJWT,
        reviewController.getAllReviewsByCompany
    )


module.exports = router;