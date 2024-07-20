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
    // required: [true, "Phone number is required"],
    match: /^\d{11}$/,
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
  googleId: String, // Store Google ID
  signedUpWithGoogle: {
    type: Boolean,
    default: false,
  },
  operatorImageUrl: {
    type: String,
    default: "http://res.cloudinary.com/dzodph4o8/image/upload/v1693051381/creator-images/qa3cdrcltw6rtgejgst2.webp"
  },
  operatorImagePublicId: {
    type: String,
    default: "creator-images/qa3cdrcltw6rtgejgst2"
  },
  gender: {
    type: String,
    enum: ["Male", "Female"],
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
    const existingUser = await User.findOne({ phoneNumber: this.phoneNumber });
    if (existingUser && existingUser._id.toString() !== this._id.toString()) {
      return next(new AppError("Phone number has been registered", 409));
    }
  }
  next();
});

OperatorSchema.pre("save", async function (next) {
  if (this.companyName !== null) {
    const existingUser = await Operator.findOne({ companyName: this.companyName });
    if (existingUser && existingUser._id.toString() !== this._id.toString()) {
      return next(new AppError("Display name has been registered", 409));
    }
  }
  next();
});

OperatorSchema.methods.createEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(3).toString('hex'); // 6-digit OTP
  this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  this.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return verificationToken;
};
const Operator = mongoose.model("Operator", OperatorSchema);

module.exports = Operator;
