const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const CONFIG = require("../config/config.js");
const authController = require("../controllers/operatorAuthController.js")
const sendEmail = require('../utils/email.js');



const authRouter = express.Router();
const operatorValidationMW = require("../validators/operator.validation.js");

authRouter.post(
  "/signup",
  operatorValidationMW,
  passport.authenticate("operator-signup", { session: false }),
  async (req, res, next) => {
   try {
    const body = {
      role: req.user.role,
      _id: req.user._id,
      email: req.user.email,
      firstName: req.user.firstName,
    };
    const token = jwt.sign({ user: body }, CONFIG.SECRET_KEY, {
      expiresIn: CONFIG.JWT_EXPIRES_IN,
    });

     // Set the JWT in an HTTP-only cookie
     res.cookie("jwt", token, {
      httpOnly: true,
      secure: true, // Set to true in production
      maxAge: 12 * 60 * 60 * 1000, // 12 hours
    });

    // Remove password from output
    req.user.password = undefined;

    const user = req.user
    const url = CONFIG.DASHBOARD
    await new sendEmail(user, url).sendOperatorWelcome();
 

    res.status(200).json({
      status: "success",
      message: "Signup successful",
      user: req.user,
      token,
    });

    

   } catch (error) {
    next(error)
   } 
  }
);

authRouter.post("/login", async (req, res, next) => {
  passport.authenticate("operator-login", async (err, user, info) => {
    try {
      if (err) {
        return next(err);
      }
      if (!user) {
        const error = new AppError("Email or Password is incorrect", 504);
        return next(error);
      }

      // Check if the user signed up with Google
      if (user.googleId) {
        return next(new AppError("Please sign in with Google", 401));
      }

      req.login(user, { session: false }, async (error) => {
        
        if (error) return next(error);

        const body = {
          role: user.role,
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
        };
        const token = jwt.sign({ user: body }, CONFIG.SECRET_KEY, {
          expiresIn: CONFIG.JWT_EXPIRES_IN,
        });

         // Set the JWT in an HTTP-only cookie
       res.cookie("jwt", token, {
        httpOnly: true,
        secure: true, // Set to true in production
        maxAge: 12 * 60 * 60 * 1000, // 12 hours
      });

        return res.status(200).json({
          status: "success",
          message: "Login successful",
          role: user.role,
          firstName: user.firstName,
          email: user.email,
          token,
        });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

// Google OAuth2 Authentication
authRouter.get(
  "/google",
  passport.authenticate("operator-google", {
    scope: ["profile", "email"],
  })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("operator-google", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful Google authentication, generate JWT token
    const user = req.user;
    const body = {
      role: user.role,
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
    };
    const token = jwt.sign({ user: body }, CONFIG.SECRET_KEY, {
      expiresIn: CONFIG.JWT_EXPIRES_IN,
    });

    res.status(200).json({
      status: "success",
      message: "Login successful",
      firstName: user.firstName,
      email: user.email,
      role: user.role,
      token,
    });
  }
);

// Password reset routes
authRouter.post('/forgot-password', authController.forgotPassword);
authRouter.patch('/reset-password/:token', authController.resetPassword);
authRouter.post('/verify-email/', authController.verifyEmail);


module.exports = authRouter;
