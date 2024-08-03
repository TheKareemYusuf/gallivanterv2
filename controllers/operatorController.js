const User = require("./../models/userModel");
const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");
const sendEmail = require("./../utils/email");

const uploadPicture = require("./../utils/multerImageHandler");
const {
  uploadToCloudinary,
  removeFromCloudinary,
} = require("./../utils/cloudinary");
const Operator = require("../models/operatorModel");

const uploadOperatorPicture = uploadPicture.single("operatorProfileImage");



const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const getAllOperators = async (req, res, next) => {
  try {
    const features = new APIFeatures(User.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const operators = await features.query;

    res.status(200).json({
      status: "success",
      result: operators.length,
      data: {
        operators,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getOperator = async (req, res, next) => {
  try {
    const id = req.params.id;
    const operator = await Operator.findById(id);

    if (!operator) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        operator,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getOperatorProfile = async (req, res, next) => {
  try {
    const id = req.user._id;
    const operator = await Operator.findById(id);

    if (!operator) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        operator,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createOperator = (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: "creator created successfully",
  });
};

const uploadOperatorProfilePicture = async (req, res, next) => {
    try {
      // Get the user id
      const id = req.user._id;
      const operator = await Operator.findById(id);
  
      // check to see if user truly exists
      if (!operator) {
        return next(new AppError("User not found", 404));
      }
  
      if (!req.file) {
        return next(new AppError("No file attached", 400));
      }
  
      // Remove the previously uploaded image from Cloudinary
      const public_id = operator.operatorImagePublicId;
      if (public_id && public_id !== "profile-image-placeholder") {
        await removeFromCloudinary(public_id);
      }
  
      // initialize image data
      let imageData = {};
  
      // uploads the image to Cloudinary if there's any
      const imageBuffer = req.file.buffer;
      const data = await uploadToCloudinary(imageBuffer, "operator-images");
      imageData = data;
  
      // update the database with the recently uploaded image
      const profileImage = await User.findByIdAndUpdate(
        id,
        {
          userImageUrl: imageData.url,
          userImagePublicId: imageData.public_id,
        },
        {
          new: true,
          runValidators: true,
          context: "query",
        }
      );
  
      res.status(200).json({
        status: "success",
        message: "Profile picture uploaded successfully",
        data: {
          userImageUrl: imageData.url,
          userImagePublicId: imageData.public_id,
        },
      });
    } catch (error) {
      next(error);
    }
  };

const updateOperatorProfile = async (req, res, next) => {
  try {
    const id = req.user._id;
    let operatorUpdate = { ...req.body };
    // if (userUpdate.state) delete userUpdate.state;


    const oldOperator = await Operator.findById(id);


    if (!oldOperator) {
      return next(
        new AppError("User not found", 404)
      );
    }

    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          "This route is not for password updates",
          400
        )
      );
    } 

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(operatorUpdate, "firstName", "lastName", "email", "phoneNumber", "address", "companyName", "gender" )

    if (filteredBody.email && filteredBody.email.toLowerCase() !== oldOperator.email.toLowerCase()) {
        const existingOperator = await Operator.findOne({ email: filteredBody.email.toLowerCase() });
        if (existingOperator) {
            return next(new AppError("Email has been registered", 409));
        }
    }

    // Check if companyName is being updated
    if (filteredBody.companyName && filteredBody.companyName !== oldOperator.companyName) {
        const newCompanyName = filteredBody.companyName.toLowerCase().trim();
  
        // Perform a case-insensitive search for existing companyName
        const existingOperator = await Operator.findOne({ 
          companyName: { $regex: new RegExp(`^${newCompanyName}$`, 'i') } 
        });
  
        if (existingOperator && existingOperator._id.toString() !== id.toString()) {
          return next(new AppError("Company name has been registered", 409));
        }
  
        // Update companyName and displayName
        filteredBody.companyName = newCompanyName;
        filteredBody.displayName = req.body.companyName; // Preserve the case-sensitive display name
      }
       // Check if email is being updated
    if (filteredBody.email && filteredBody.email !== oldOperator.email) {
      // Generate email verification token
      const verificationToken = oldOperator.createEmailVerificationToken();
      filteredBody.emailVerificationToken = verificationToken;
      filteredBody.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Send verification email
      const verificationURL = `${req.protocol}://${req.get('host')}/api/v1/operators/verify-email/${verificationToken}`;
      await new sendEmail(oldOperator, verificationURL).sendEmailVerification();
    }

        
      
    // 3) Update user document
    const updatedOperator = await Operator.findByIdAndUpdate(id, filteredBody, {
      new: true,
      runValidators: true,
      context: "query"
    });

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: updatedOperator,
    
    });
  } catch (error) {
    next(error);
  }
};

const updateOperatorStatus = async (req, res, next) => {
  try {
    let status = req.body.status;
    const id = req.params.id;

    // const oldCreator = await Creator.findById(id);

    // Checking if the user attempting to update is the author
    // if (req.user._id.toString() !== oldQuestion.creatorId._id.toString()) {
    //   return next(
    //     new AppError("You cannot edit as you're not the author", 403)
    //   );
    // }

    if (
      !(
        status &&
        (status.toLowerCase() === "active" ||
          status.toLowerCase() === "non-active" ||
          status.toLowerCase() === "deactivated")
      )
    ) {
      return next(new AppError("Please provide a valid status"));
    }

    const operator = await Operator.findByIdAndUpdate(
      id,
      { status: status.toLowerCase() },
      { new: true, runValidators: true, context: "query" }
    );

    if (!operator) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Status updated successfully",
      data: operator,
    });
  } catch (error) {
    next(error);
  }
};

const deleteOperator = async (req, res, next) => {
  try {
    const id = req.params.id;
    const oldOperator = await Operator.findById(id);

    if (!oldOperator) {
      return next(new AppError("User not found", 404));
    }

    await Operator.findByIdAndRemove(id);

    res.status(200).json({
      status: "success",
      message: "User successfully deleted",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};



module.exports = {
  getAllOperators,
  getOperator,
  getOperatorProfile,
  createOperator,
  updateOperatorStatus,
  updateOperatorProfile,
  deleteOperator,
  uploadOperatorPicture,
  uploadOperatorProfilePicture,
};
