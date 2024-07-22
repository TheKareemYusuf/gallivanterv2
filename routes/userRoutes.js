const express = require("express");
const passport = require("passport");
const userController = require("./../controllers/userController");
const userAuthController = require("./../controllers/userAuthController");

const UserValidationMW = require("./../validators/user.validation");
const restrictToMW = require("./../authentication/restrictionHandler");

const router = express.Router();

router
  .route("/get-profile")
  .get(
    passport.authenticate("jwt", { session: false }),
    userController.getUserProfile
  );

router
  .route("/update-profile")
  .put(
    passport.authenticate("jwt", { session: false }),
    userController.updateUserProfile
  );

  router
  .route("/update-profile-picture")
  .patch(
    passport.authenticate("jwt", { session: false }),
    userController.uploadUserPicture,
    userController.uploadUserProfilePicture
  );


// router.patch('/updatePassword/', userAuthController.updatePassword);


router
  .route("/")
  .get(
    passport.authenticate("jwt", { session: false }),
    restrictToMW.restrictTo("admin"),
    userController.getUser
  )
  .patch(
    UserValidationMW,
    passport.authenticate("jwt", { session: false }),
    userController.updateUserProfile
  );

router
  .route("/:id")
  .get(
    passport.authenticate("jwt", { session: false }),
    restrictToMW.restrictTo("admin"),
    userController.getUser
  )
  .put(
    UserValidationMW,
    passport.authenticate("jwt", { session: false }),
    restrictToMW.restrictTo("admin"),
    userController.updateUserProfile
  )
  .patch(
    UserValidationMW,
    passport.authenticate("jwt", { session: false }),
    restrictToMW.restrictTo("admin"),
    userController.updateUserStatus
  )
  .delete(
    passport.authenticate("jwt", { session: false }),
    restrictToMW.restrictTo("admin"),
    userController.deleteUser
  );

module.exports = router;
