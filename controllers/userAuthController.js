const crypto = require('crypto');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email'); 
const jwt = require("jsonwebtoken");
const CONFIG = require("./../config/config");



const forgotPassword = async (req, res, next) => {
  try {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    // Possibly use base URL here
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;

    // const message = `Forgot your password? Kindly click this link to reset your password: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
      await new sendEmail(user, resetURL).sendPasswordReset()

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new AppError('There was an error sending the email. Try again later!', 500));
    }
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }

     // Validate passwords
     if (!req.body.password || !req.body.confirmPassword) {
        return next(new AppError('Please provide both password and confirm password', 400));
      }
  
      if (req.body.password !== req.body.confirmPassword) {
        return next(new AppError('Passwords do not match', 400));
      }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now() - 1000;
    await user.save();



    // 4) Log the user in, send JWT
    const body = {
        role: user.role,
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
      };
    const token = jwt.sign({ user: body }, CONFIG.SECRET_KEY, {
      expiresIn: '12h',
    });

    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
    forgotPassword,
    resetPassword
}