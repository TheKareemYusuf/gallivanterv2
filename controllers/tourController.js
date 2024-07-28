const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const Operator = require("../models/operatorModel");
const mongoose = require('mongoose');
const slugify = require('slugify');
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


const uploadTourPicture = uploadPicture.single("tourCoverImage");
const uploadMultiplePictures = uploadPicture.array("tourImages");


const createTour = async (req, res, next) => {
    try {
        const id = req.user._id;
        const user = await Operator.findById(id);
        if (!user) {
            return next(new AppError("Operator not found", 404));
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


        const normalizedTourTitle = tourTitle.toLowerCase();
        const slug = slugify(`${user.companyName} ${normalizedTourTitle}`, { lower: true, strict: true });

         // Check for existing tour with the same normalized title
         const existingTour = await Tour.findOne({
            normalizedTourTitle,
            operatorId: req.user._id
        });

        if (existingTour) {
            return next(new AppError(`You already have a tour with this title ${tourTitle}`, 400));
        }

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
            companyName: user.companyName,
            slug
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
            const newSlug = slugify(`${oldTour.companyName} ${tourUpdate.normalizedTourTitle}`, { lower: true, strict: true });

            // Check for existing tour with the new slug
            const existingTour = await Tour.findOne({ slug: newSlug });
            if (existingTour && existingTour._id.toString() !== oldTour._id.toString()) {
                return next(new AppError(`A tour with the slug ${newSlug} already exists`, 400));
            }

            tourUpdate.slug = newSlug; // Update slug
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

// const deleteImage = async (req, res, next) => {
//     try {
//       const { tourIdOrSlug, imagePublicId } = req.body;
//       const operatorId = req.user._id;
  
//       // Find the tour by ID
//       const tour = await Tour.findById(tourId);
  
//       if (!tour) {
//         return next(new AppError("Tour not found", 404));
//       }

  
//       // Find the index of the image to be deleted
//       const imageIndex = tour.gallery.findIndex( 
//         (image) => image.imagePublicId === imageId
//       );
  
//       if (imageIndex === -1) {
//         return res.status(404).json({ message: "Image not found" });
//       }
  
//       // Get the public ID of the image
//       const publicId = tour.gallery[imageIndex].imagePublicId;
  
//       // Delete the image from Cloudinary
//       await removeFromCloudinary(publicId);
  
//       // Remove the image from the tour document
//       tour.gallery.splice(imageIndex, 1);
  
//       // Save the updated tour document
//       await tour.save();
  
//       return res
//         .status(200)
//         .json({ status: "success", message: "Image deleted successfully" });
//     } catch (error) {
//       next(error);
//     }
//   };

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



// Add a tour to the user's wishlist
const addToWishlist = async (req, res, next) => {
    try {
        const userId = req.user._id; // Get the authenticated user's ID
        const tourIdOrSlug = req.params.tourIdOrSlug; // Get the tour ID from the request body

        const isObjectId = mongoose.Types.ObjectId.isValid(tourIdOrSlug);

        // Check if the tour exists
        const tour = await Tour.findOne(isObjectId ? { _id: tourIdOrSlug } : { slug: tourIdOrSlug });
        if (!tour) {
            return next(new AppError("Tour not found", 404));
        }

        // Find the user and update their wishlist
        const user = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { wishList: tour._id } }, // Use $addToSet to avoid duplicates
            { new: true, runValidators: true }
        );

        if (!user) {
            return next(new AppError("User not found", 404));
        }

        res.status(200).json({
            status: "success",
            message: "Tour added to wishlist successfully",
            data: user.wishList, // Return the updated wishlist
        });
    } catch (error) {
        next(error);
    }
};

const getUserWishlistTours = async (req, res, next) => {
    try {
        const userId = req.user._id; // Get the authenticated user's ID

        // Find the user and populate their wishlist with tour details
        const user = await User.findById(userId).populate('wishList');

        if (!user) {
            return next(new AppError("User not found", 404));
        }

        res.status(200).json({
            status: "success",
            message: "Wishlist tours fetched successfully",
            data: user.wishList, // Return the user's wishlist with tour details
        });
    } catch (error) {
        next(error);
    }
};

const deleteTour = async (req, res, next) => {
    try {
        const tourIdOrSlug = req.params.tourIdOrSlug; // Get the tour ID from the request body

        const isObjectId = mongoose.Types.ObjectId.isValid(tourIdOrSlug);

        // Check if the tour exists
        const tour = await Tour.findOne(isObjectId ? { _id: tourIdOrSlug } : { slug: tourIdOrSlug });
        if (!tour) {
            return next(new AppError("Tour not found", 404));
        }

      await Tour.findByIdAndDelete(tour._id);
  
      res.status(200).json({
        status: "Tour successfully deleted",
        data: null,
      });
    } catch (error) {
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
    getOneTour,
    addToWishlist,
    getUserWishlistTours,
    deleteTour
}