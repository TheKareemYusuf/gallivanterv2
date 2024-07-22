const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const crypto = require('crypto');
const AppError = require('./../utils/appError');



const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please enter first name"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Please enter last name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
      // required: function () {
      //   return this.isNew || this.isModified("password");
      // },
    },
    confirmPassword: {
      type: String,
      select: false,
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same!",
      },
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (value) {
          return value === null || validator.isMobilePhone(value, "any", { strictMode: false });
        },
        message: "Please enter a valid phone number!",
      },
      default: null,
    },
    googleId: String, // Store Google ID
    signedUpWithGoogle: {
      type: Boolean,
      default: false,
    },
   
    userImageUrl: {
      type: String,
      default:
        "https://res.cloudinary.com/djvqftiri/image/upload/v1721555127/profile-image-placeholder.png"
    },
    userImagePublicId: {
      type: String,
      default: "profile-image-placeholder",
    },
    // agreed_to_terms: {
    //   type: Boolean,
    //   default: false, // Set default value to false
    //   // required: [true, "Please agree to terms"]
    // },
    role: {
      type: String,
      default: "user",
    },
    tours: {
        type: [
          {
            type: mongoose.Schema.Types.ObjectId,
          },
        ],
        default: [],
      },
      wishList: {
        type: [
          {
            type: mongoose.Schema.Types.ObjectId,
          },
        ],
        default: [],
      },

      gender: {
        type: String,
        enum: ["male", "female"],
        // required: [true, "Please select your gender"],
        // default: "creator",
      },
      status: {
        type: String,
        enum: ["active", "non-active", "deactivated"],
        default: "active",
      },
      dateOfBirth: {
        type: Date,
        // required: true
      },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);


// Hash the password
UserSchema.pre("save", async function (next) {
  const user = this;

  if (!this.isModified("password")) return next();

  const hash = await bcrypt.hash(this.password, 12);

  this.password = hash;

  this.confirmPassword = undefined;
  next();
});

UserSchema.pre("save", async function (next) {
  if (this.phoneNumber !== null) {
    const existingUser = await User.findOne({ phoneNumber: this.phoneNumber });
    if (existingUser && existingUser._id.toString() !== this._id.toString()) {
      return next(new AppError("Phone number has been registered", 409));
    }
  }
  next();
});


UserSchema.methods.isValidPassword = async function (password) {
  const user = this;
  const compare = await bcrypt.compare(password, user.password);

  return compare;
};


// sets user status 
// userSchema.pre(/^find/, function(next) {
//   // this points to the current query
//   this.find({ active: { $ne: false } });
//   next();
// });



// compares user passwords
UserSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
//   if (this.passwordChangedAt) {
//     const changedTimestamp = parseInt(
//       this.passwordChangedAt.getTime() / 1000,
//       10
//     );

//     return JWTTimestamp < changedTimestamp;
//   }

//   // False means NOT changed
//   return false;
// };

UserSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

UserSchema.methods.createEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(3).toString('hex'); // 6-digit OTP
  this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  this.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return verificationToken;
};
const User = mongoose.model("User", UserSchema);

module.exports = User;
