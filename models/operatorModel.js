const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const { boolean } = require("joi");
const crypto = require('crypto');
const AppError = require('../utils/appError');


const OperatorSchema = new mongoose.Schema({
  firstName: {
    type: String,
    // required: [true, "Please enter first name"],
    lowercase: true,
    trim: true,
  },
  lastName: {
    type: String,
    // required: [true, "Please enter last name"],
    lowercase: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
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
  googleId: String, // Store Google ID
  signedUpWithGoogle: {
    type: Boolean,
    default: false,
  },
  operatorImageUrl: {
    type: String,
    default: "https://res.cloudinary.com/djvqftiri/image/upload/v1721555127/profile-image-placeholder.png"
  },
  operatorImagePublicId: {
    type: String,
    default: "profile-image-placeholder",
  },
  gender: {
    type: String,
    enum: ["male", "female"],
  },
  status: {
    type: String,
    enum: ["active", "non-active", "deactivated"],
    default: "active",
  },
  companyName: {
    type: String,
    unique: true,
    // required: [true, "Please enter your company name"],
    trim: true,
    default: null
  },
  displayName: { type: String }, // Store the original company name for display purposes

  address: String,
  agreed_to_terms: {
    type: Boolean,
    default: false, // Set default value to false
    // required: [true, "Please agree to terms"]
  }, 
  role: {
    type: String,
    enum: ["operator", "admin"],
    default: "operator",
  },
},
{ timestamps: true });

OperatorSchema.pre("save", async function (next) {
  const user = this;

  if (!this.isModified("password")) return next();

  const hash = await bcrypt.hash(this.password, 12);

  this.password = hash;

  this.confirmPassword = undefined;
  next();
});

OperatorSchema.methods.isValidPassword = async function (password) {
  const user = this;
  const compare = await bcrypt.compare(password, user.password);

  return compare;
}

OperatorSchema.pre("save", async function (next) {
  if (this.phoneNumber !== null) {
    const existingUser = await Operator.findOne({ phoneNumber: this.phoneNumber });
    if (existingUser && existingUser._id.toString() !== this._id.toString()) {
      return next(new AppError("Phone number has been registered", 409));
    }
  }
  next();
});

// OperatorSchema.pre("save", async function (next) {
//   if (this.companyName !== null) {
//     const existingUser = await Operator.findOne({ companyName: this.companyName });
//     if (existingUser && existingUser._id.toString() !== this._id.toString()) {
//       return next(new AppError("Display name has been registered", 409));
//     }
//   }
//   next();
// });

// Ensure company name is unique and set display name
OperatorSchema.pre('save', async function (next) {
  if (this.companyName) {
    this.companyName = this.companyName.toLowerCase().trim();

    // Perform a case-insensitive search for existing companyName
    const existingUser = await Operator.findOne({ 
      companyName: { $regex: new RegExp(`^${this.companyName}$`, 'i') } 
    });

    // Check if existing user is not the same as the current document being saved
    if (existingUser && existingUser._id.toString() !== this._id.toString()) {
      return next(new AppError("Company name has been registered", 409));
    }
  

    // Set displayName to the original companyName (case-sensitive)
    this.displayName = this.companyName;
  }

  next();
});

OperatorSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};



OperatorSchema.methods.createEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(3).toString('hex'); // 6-digit OTP
  this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  this.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return verificationToken;
};
const Operator = mongoose.model("Operator", OperatorSchema);

module.exports = Operator;
