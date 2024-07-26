const passport = require("passport");
const passportCustom = require("passport-custom");
const CONFIG = require("./../config/config");
const AppError = require("./../utils/appError");
const sendEmail = require("./../utils/email")

const User = require("./../models/userModel");

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
  "user-signup",
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

      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        phoneNumber,
        agreedToTerms,
      });

      // Generate OTP and send email
      const otp = user.createEmailVerificationToken();
      await user.save({ validateBeforeSave: false });

      const verificationToken = otp;
      await new sendEmail(user, verificationToken).sendEmailVerification();


      return next(null, user);
    } catch (error) {
      next(error);
    }
  })
);

passport.use(
  "user-login",
  new passportCustom(async (req, next) => {
    try {
      const { email, password } = req.body;
      // const user = await User.findOne({ phoneNumber });
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return next(new AppError("Email or Password is incorrect", 401));
      }

      const validate = await user.isValidPassword(password);

      if (!validate) {
        return next(new AppError("Email or Password is incorrect", 401));
      }

      return next(null, user, { message: "Logged in Successfully" });
    } catch (error) {
      return next(error);
    }
  })
);

passport.use(
  "user-google",
  new GoogleStrategy(
    {
      clientID: CONFIG.GOOGLE_CLIENT_ID,
      clientSecret: CONFIG.GOOGLE_CLIENT_SECRET,
      callbackURL: CONFIG.GOOGLE_CALLBACK_USER,
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, next) {
      // Use profile information (e.g., email) to find or create a user in your database
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        console.log(profile);
        console.log({
          email: profile.email,
          picture: profile.picture,
          firstName: profile.given_name,
          lastName: profile.family_name, firstName: profile.given_name,
          lastName: profile.family_name,
        });

        if (!user) {
          // If the user doesn't exist, create a new user with the provided email
          user = await User.create({
            email: profile.emails[0].value,
            firstName: profile.given_name,
            lastName: profile.family_name,
            userImageUrl: profile.picture,
            signedUpWithGoogle: true,
            googleId: profile.id
            // You may want to extract other information from the profile
            // and save it to your user database.
          });
        }

        return next(null, user);
      } catch (error) {
        return next(error, null);
      }
    }
  )
);

// Passport serialization and deserialization
passport.serializeUser((user, next) => {
  next(null, user.id);
});

passport.deserializeUser((id, next) => {
  User.findById(id, (err, user) => {
    next(err, user);
  });
});