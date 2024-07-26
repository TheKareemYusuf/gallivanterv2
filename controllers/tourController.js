const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const Operator = require("../models/operatorModel");
const mongoose = require('mongoose');
const uploadPicture = require("../utils/multerImageHandler");
// const logger = require("../utils/logger")
const sendEmail = require("../utils/email");
const CONFIG = require("./../config/config");
// const multer = require("multer");
// const sharp = require("sharp");

//-----------------------------------------------------

const {
    uploadToCloudinary,
    removeFromCloudinary,
} = require("./../utils/cloudinary");
const OperatorValidationMW = require("../validators/operator.validation");

const uploadTourPicture = uploadPicture.single("tourCoverImage");
const uploadMultiplePictures = uploadPicture.array("tourImages");


const createTour = async (req, res, next) => {
    try {
        const id = req.user._id;
        const user = await Operator.findById(id);
        if (!user) {
            return next(new AppError("Creator not found", 404));
        }

        if (!user.companyName || user.companyName === null) {
            return next(new AppError("Please update your company name", 400));
        }


        // Extract required tour details from request body
        const {
            tourType,
            tourTitle,
            tourDescription,
            startDate,
            endDate,
            arrivalTime,
            departureTime,
            tourCategory,
            minTraveler,
            maxTraveler,
            tourCoverage
        } = req.body;


        // Normalize the tourTitle
        const normalizedTourTitle = tourTitle.toLowerCase();

        // Save tour details to the database
        const newTour = await Tour.create({
            tourType,
            tourTitle,
            normalizedTourTitle, // Include normalized title
            tourDescription,
            startDate,
            endDate,
            arrivalTime,
            departureTime,
            tourCategory,
            minTraveler,
            maxTraveler,
            tourCoverage,
            operatorId: req.user._id,
            operatorName: req.user.firstName,
            companyName: user.companyName
        });

        // Construct response object
        const response = {
            status: "success",
            message: "Tour created successfully",
            data: newTour,
        };

        // Send response to frontend
        res.status(201).json(response);
    } catch (error) {
        //   logger.error(`Failed to create tour: ${error.message}`);
        next(error);
    }
};


// const updateTour = async (req, res, next) => {
//     try {
//         let tourUpdate = { ...req.body };
//         const id = req.params.tourId;
//         const slug = req.params.slug;

//         const operatorId = req.user._id;

//         tourUpdate.state = "draft";

//         const oldTour = await Tour.findById(id);

//         if (!oldTour) {
//             return next(new AppError("Tour not found", 404));
//         }

//         if (operatorId.toString() !== oldTour.operatorId._id.toString()) {
//             return next(new AppError("You are not authorized", 403));
//         }

//         const tour = await Tour.findByIdAndUpdate(id, tourUpdate, {
//             new: true,
//             runValidators: true,
//             context: "query",
//         });

//         if (!tour) {
//             return next(new AppError("Tour not found", 404));
//         }

//         res.status(200).json({
//             status: "success",
//             message: "Tour updated successfully",
//             data: tour,
//         });
//     } catch (error) {
//         next(error);
//     }
// };


const updateTour = async (req, res, next) => {
    try {
        const { tourIdOrSlug } = req.params;
        const operatorId = req.user._id;
        let tourUpdate = { ...req.body };

        tourUpdate.state = "draft";

        // Check if tourIdOrSlug is a valid ObjectId
        const isObjectId = mongoose.Types.ObjectId.isValid(tourIdOrSlug);

        // Find the tour by either ID or slug
        const oldTour = await Tour.findOne(isObjectId ? { _id: tourIdOrSlug } : { slug: tourIdOrSlug });

        if (!oldTour) {
            return next(new AppError("Tour not found", 404));
        }

        if (operatorId.toString() !== oldTour.operatorId.toString()) {
            return next(new AppError("You are not authorized to update this tour", 403));
        }

        // Normalize the tourTitle and update slug if necessary
        if (tourUpdate.tourTitle) {
            tourUpdate.normalizedTourTitle = tourUpdate.tourTitle.toLowerCase().trim();
            // slug will be updated in pre-save hook
        }

        // Update the tour
        const tour = await Tour.findByIdAndUpdate(oldTour._id, tourUpdate, {
            new: true,
            runValidators: true,
            context: "query"
        });

        if (!tour) {
            return next(new AppError("Failed to update tour", 400));
        }

        res.status(200).json({
            status: "success",
            message: "Tour updated successfully",
            data: tour
        });

    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            return next(new AppError("Invalid tour ID or slug", 400));
        }
        next(error);
    }
};

const addImages = async (req, res, next) => {
    try {
        const id = req.user._id;
        const user = await Operator.findById(id);
        if (!user) {
            return next(new AppError("Creator not found", 404));
        }

        const tourId = req.params.tourId;

        const tour = await Tour.findById(tourId);

        if (!tour) {
            return next(new AppError("Tour not found", 404));
        }

        let imageData = [];

        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const imageBuffer = req.files[i].buffer;
                const data = await uploadToCloudinary(imageBuffer, "tour-images");
                //   // Save the URL of the uploaded image to the tour model
                //   tour.tourImagesUrl.push(data.url);
                //   // Optionally, save the public ID of the uploaded image to the tour model
                //   tour.tourImagesPublicIds.push(data.public_id);
                //   imageData.push(data);
                // }

                // Create a new gallery entry
                const newGalleryEntry = {
                    imageUrl: data.url,
                    imagePublicId: data.public_id
                };

                // Push the new gallery entry to the tour's gallery
                tour.gallery.push(newGalleryEntry);
                imageData.push(newGalleryEntry);
            }
        }
        // Save the updated tour model
        await tour.save();

        return res.status(200).json({
            status: "success",
            message: "Images uploaded successfully",
            images: imageData,
        });
    } catch (error) {
        next(error);
    }
};

const getTours = async (req, res, next) => {
    try {
        const tours = await Tour.find(); // Fetch all tours from the database

        res.status(200).json({
            status: "success",
            results: tours.length,
            data: {
                tours,
            },
        });
    } catch (error) {
        next(error);
    }
};

const getTourWithSlug = async (req, res, next) => {
    try {
        const slug = req.params.slug;
        const tour = await Tour.findOne({ slug });
        if (!tour) {
            return next(new AppError("Tour not found", 404));
        }

        res.status(200).json({
            status: "success",
            data: {
                tour,
            },
        });
    } catch (error) {
        next(error);
    }
};

const getOperatourTours = async (req, res, next) => {
    try {
        // grab the id of the person hitting the route from req.body
        const id = req.user._id;
        // use the id to query the database to get role
        const user = await Operator.findById(id);
        if (!user) {
            return next(new AppError("Operator not found", 404));
        }

        if (user.role === "operator") {
            const features = new APIFeatures(
                Tour.find().where("operatorId").equals(id),
                req.query
            )
                .filter()
                .sort()
                .limitFields()
                .paginate();
            const tours = await features.query;

            res.status(200).json({
                status: "success",
                result: tours.length,
                data: {
                    tours,
                },
            });
        } else {
            const features = new APIFeatures(
                Tour.find(),
                req.query
            )
                .filter()
                .sort()
                .limitFields()
                .paginate();
            const tours = await features.query;

            res.status(200).json({
                status: "success",
                result: tours.length,
                data: {
                    tours,
                },
            });
        }
    } catch (error) {
        next(error);
    }
};


const getAOperatorTour = async (req, res, next) => {
    try {
        // const id = req.params.tourId;
        // const tour = await Tour.findById(id);
        // grab the id of the person hitting the route from req.body

        const { tourIdOrSlug } = req.params;
        const operatorId = req.user._id;
        // use the id to query the database to get role
        const user = await Operator.findById(operatorId);

        if (!user) {
            return next(new AppError("User not found", 404));
        }

        // Check if tourIdOrSlug is a valid ObjectId
        const isObjectId = mongoose.Types.ObjectId.isValid(tourIdOrSlug);

        // Find the tour by either ID or slug
        const tour = await Tour.findOne(isObjectId ? { _id: tourIdOrSlug } : { slug: tourIdOrSlug });
        if (!tour) {
            return next(new AppError("Tour not found", 404));
        }

        if (!tour) {
            return next(new AppError("Tour not found", 404));
        }

        res.status(200).json({
            status: "success",
            data: {
                tour,
            },
        });
    } catch (error) {
        next(error);
    }
};

const updateTourState = async (req, res, next) => {
    try {

        const { tourIdOrSlug } = req.params;
        const operatorId = req.user._id;

        let state = req.body.state;
        // Check if tourIdOrSlug is a valid ObjectId
        const isObjectId = mongoose.Types.ObjectId.isValid(tourIdOrSlug);

        // Find the tour by either ID or slug
        const oldTour = await Tour.findOne(isObjectId ? { _id: tourIdOrSlug } : { slug: tourIdOrSlug });

        if (!oldTour) {
            return next(new AppError("Tour not found", 404));
        }

        if (operatorId.toString() !== oldTour.operatorId.toString()) {
            return next(new AppError("You are not authorized to update this tour", 403));
        }
        if (
            !(
                state &&
                (state.toLowerCase() === "draft" || state.toLowerCase() === "published")
            )
        ) {
            return new AppError("Please provide a valid state", 400);
        }

        const tour = await Tour.findByIdAndUpdate(
            oldTour._id,
            { state: state.toLowerCase() },
            { new: true, runValidators: true, context: "query" }
        );

        if (!tour) {
            return next(new AppError("Tour not found", 404));
        }

        res.status(200).json({
            status: "Tour Published Successfully",
            data: tour,
        });
    } catch (error) {
        next(error);
    }
}

// Get all tours
const getAllTours = async (req, res, next) => {
    try {
      const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
      const tours = await features.query;
  
      res.status(200).json({
        status: "success",
        result: tours.length,
        data: {
          tours,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  const getOneTour = async (req, res, next) => {
    try {
      const { tourIdOrSlug } = req.params;
  
      // Check if tourIdOrSlug is a valid ObjectId
      const isObjectId = mongoose.Types.ObjectId.isValid(tourIdOrSlug);
  
      // Find the tour by either ID or slug
      const tour = await Tour.findOne(isObjectId ? { _id: tourIdOrSlug } : { slug: tourIdOrSlug });
  
      if (!tour) {
        return next(new AppError("Tour not found", 404));
      }
  
      res.status(200).json({
        status: "success",
        data: tour
      });
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        return next(new AppError("Invalid tour ID or slug", 400));
      }
      next(error);
    }
  };

module.exports = {
    createTour,
    updateTour,
    uploadMultiplePictures,
    addImages,
    getOperatourTours,
    getAOperatorTour,
    updateTourState,
    getTourWithSlug,
    getAllTours,
    getOneTour
}