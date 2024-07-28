const express = require("express");
const passport = require("passport");
const reviewController = require("../controllers/reviewController");
const ReviewValidationMW = require("../validators/review.validation");

const router = express.Router();


router.route("/tour/:tourIdOrSlug")
.post(
    passport.authenticate("jwt", { session: false }),
    ReviewValidationMW,
    reviewController.createReview
).get(
    passport.authenticate("jwt", { session: false }),
    reviewController.getAllReviewsByTour
)

router.route("/")
    .get(
        passport.authenticate("jwt", { session: false }),
        reviewController.getAllReviewsByUser
    );


router.route("/:reviewId")
    .get(
        passport.authenticate("jwt", { session: false }),
        reviewController.getOneReview
    )
    .put(
        passport.authenticate("jwt", { session: false }),
        reviewController.updateReview
    )
    .delete(
        passport.authenticate("jwt", { session: false }),
        reviewController.deleteReview
    )

router.route("/company/:companyName")
    .get(
        passport.authenticate("jwt", { session: false }),
        reviewController.getAllReviewsByCompany
    )


module.exports = router;