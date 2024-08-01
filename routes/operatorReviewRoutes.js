const express = require("express");
const passport = require("passport");
const reviewController = require("./../controllers/reviewController");
const ReviewValidationMW = require("./../validators/review.validation");
const verifyJWT = require("./../utils/verifyJWT");

const router = express.Router();

router.route("/")
    .get(
        // passport.authenticate("jwt", { session: false }),
        verifyJWT,
        reviewController.getAllReviewsByOperator
    )


module.exports = router;