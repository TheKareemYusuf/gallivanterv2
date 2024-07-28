const express = require("express");
const passport = require("passport");
const reviewController = require("./../controllers/reviewController");
const ReviewValidationMW = require("./../validators/review.validation");

const router = express.Router();

router.route("/")
    .get(
        passport.authenticate("jwt", { session: false }),
        reviewController.getAllReviewsByOperator
    )

module.exports = router;