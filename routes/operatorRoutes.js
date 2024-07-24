const express = require("express");
const passport = require("passport");
const operatorController = require("./../controllers/operatorController");
const operatorAuthController = require("./../controllers/operatorAuthController");

const OperatorValidationMW = require("./../validators/operator.validation");
const restrictToMW = require("./../authentication/restrictionHandler");

const router = express.Router();

router
  .route("/get-profile")
  .get(
    passport.authenticate("jwt", { session: false }),
    operatorController.getOperatorProfile
  );

router
  .route("/update-profile")
  .put(
    OperatorValidationMW,
    passport.authenticate("jwt", { session: false }),
    operatorController.updateOperatorProfile
  );

  router
  .route("/update-profile-picture")
  .patch(
    passport.authenticate("jwt", { session: false }),
    operatorController.uploadOperatorPicture, // Ensure this matches the field name in the form
    operatorController.uploadOperatorProfilePicture
  );


// router.patch('/updatePassword/', userAuthController.updatePassword);


router
  .route("/")
  .get(
    passport.authenticate("jwt", { session: false }),
    restrictToMW.restrictTo("admin"),
    operatorController.getOperator
  )
  .patch(
    OperatorValidationMW,
    passport.authenticate("jwt", { session: false }),
    operatorController.updateOperatorProfile
  );

router
  .route("/:id")
  .get(
    passport.authenticate("jwt", { session: false }),
    restrictToMW.restrictTo("admin"),
    operatorController.getOperator
  )
  .put(
    OperatorValidationMW,
    passport.authenticate("jwt", { session: false }),
    restrictToMW.restrictTo("admin"),
    operatorController.updateOperatorProfile
  )
  .patch(
    OperatorValidationMW,
    passport.authenticate("jwt", { session: false }),
    restrictToMW.restrictTo("admin"),
    operatorController.updateOperatorStatus
  )
  .delete(
    passport.authenticate("jwt", { session: false }),
    restrictToMW.restrictTo("admin"),
    operatorController.deleteOperator
  );

module.exports = router;
