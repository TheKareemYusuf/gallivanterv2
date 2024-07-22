const passport = require("passport");
const passportCustom = require("passport-custom");
const CONFIG = require("../config/config");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email")

const Operator = require("./../models/operatorModel");

const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const GoogleStrategy = require("passport-google-oauth2").Strategy;

passport.use(
  new JWTstrategy(
    {
      secretOrKey: CONFIG.SECRET_KEY,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    },
    async (token, next) => {
      try {
        return next(null, token.user);
      } catch (error) {
        next(error);
      }
    }
  )
);

passport.use(
  "operator-signup",
  new passportCustom(async (req, next) => {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        phoneNumber,
        agreedToTerms,
      } = req.body;

      // Check if a user with the provided username exists
      // const existingEmail = await User.findOne({ email });
      // if (existingEmail) {
      //   return next(null, false, { message: "Email is already registered" });
      // }

      if (agreedToTerms === false) {
        return next(
          new AppError("Please agree to our terms and condition", 403)
        );
      }

      const operator = await Operator.create({
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        phoneNumber,
        agreedToTerms,
      });

      // Generate OTP and send email
      const otp = operator.createEmailVerificationToken();
      await operator.save({ validateBeforeSave: false });

      const verificationToken = otp;
      await new sendEmail(operator, verificationToken).sendEmailVerification();


      return next(null, operator);
    } catch (error) {
      next(error);
    }
  })
);

passport.use(
  "operator-login",
  new passportCustom(async (req, next) => {
    try {
      const { email, password } = req.body;
      // const user = await User.findOne({ phoneNumber });
      const operator = await Operator.findOne({ email }).select("+password");

      if (!operator) {
        return next(new AppError("Email or Password is incorrect", 404));
      }

      const validate = await operator.isValidPassword(password);
      console.log("Operator found:", operator);
      console.log("Password validation result:", validate);

      if (!validate) {
        return next(new AppError("Email or Password is incorrect", 404));
      }

      return next(null, operator, { message: "Logged in Successfully" });
    } catch (error) {
      return next(error);
    }
  })
);


passport.use(
  "operator-google",
  new GoogleStrategy(
    {
      clientID: CONFIG.GOOGLE_CLIENT_ID,
      clientSecret: CONFIG.GOOGLE_CLIENT_SECRET,
      callbackURL: CONFIG.GOOGLE_CALLBACK_OPERATOR,
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, next) {
      try {
        let user = await Operator.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = await Operator.create({
            email: profile.emails[0].value,
            firstName: profile.given_name,
            lastName: profile.family_name,
            userImageUrl: profile.picture,
            signedUpWithGoogle: true,
            googleId: profile.id,
            phoneNumber: null
          });
        }

        return next(null, user);
      } catch (error) {
        return next(error, null);
      }
    }
  )
);

passport.serializeUser((user, next) => {
  next(null, user.id);
});

passport.deserializeUser((id, next) => {
  Operator.findById(id, (err, user) => {
    next(err, user);
  });
});
