const mongoose = require('mongoose');
const Booking = require("../models/bookingModel");
const AppError = require("../utils/appError");
const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const generateBookingCode = require("../utils/bookingCodeGenerator");
const APIFeatures = require("../utils/apiFeatures");


// Create a new booking
const createBooking = async (req, res, next) => {
    try {

        const { tourIdOrSlug } = req.params;
        const tour = await Tour.findOne({ $or: [{ _id: tourIdOrSlug }, { slug: tourIdOrSlug }] });
        if (!tour) {
            return next(new AppError('Tour not found', 404));
        }

        // Check if booking can be made
        await tour.updateNumberOfBookings(); // Update number of bookings before creating a new one


        const {
            userId,
            numberOfParticipants,
            contactDetails,
            activityDetails,
        } = req.body;

        // Generate a booking code
        const bookingCode = generateBookingCode();




        // Prepare booking data
        const bookingData = {
            status: 'upcoming',
            userId,
            numberOfParticipants,
            bookingCode,
            tourCategory: tour.tourCategory,
            tourTitle: tour.tourTitle,
            operatorId: tour.operatorId,
            companyName: tour.companyName,
            tourType: tour.tourType,
            startDate: tour.startDate,
            endDate: tour.endDate,
            tourId: tour._id,
            price: tour.pricing.price,
            contactDetails: {
                firstName: contactDetails.firstName,
                lastName: contactDetails.lastName,
                email: contactDetails.email,
                phoneNumber: contactDetails.phoneNumber,
            },
            activityDetails: activityDetails.map(activity => ({
                firstName: activity.firstName,
                lastName: activity.lastName,
                dateOfBirth: activity.dateOfBirth,
                specialRequirements: activity.specialRequirements,
            })),
            userFullName: `${contactDetails.firstName} ${contactDetails.lastName}`,

        };


        const newBooking = await Booking.create(bookingData);
        res.status(201).json({
            status: "success",
            data: newBooking,
        });
    } catch (error) {
        next(error);
    }
};

// // Get all bookings
// const getAllBookings = async (req, res, next) => {
//     try {

//         if (req.user) {
//             if (req.user.role === 'admin') {
//                 // Admin can see all bookings
//                 const features = new APIFeatures(
//                     Booking.find(),
//                     req.query
//                 )
//                     .filter()
//                     .sort()
//                     .limitFields()
//                     .paginate();
//                 bookings = await features.query;
//             } else if (req.user.role === 'user') {
//                 // User can see their own bookings
//                 const features = new APIFeatures(
//                     Booking.find().where("userId").equals(req.user._id),
//                     req.query
//                 )
//                     .filter()
//                     .sort()
//                     .limitFields()
//                     .paginate();
//                 bookings = await features.query;
//             } else if (req.user.role === 'operator') {
//                 // Operator can see bookings related to their tours
//                 const features = new APIFeatures(
//                     Booking.find().where("operatorId").equals(req.user._id),
//                     req.query
//                 )
//                     .filter()
//                     .sort()
//                     .limitFields()
//                     .paginate();
//                 bookings = await features.query;
//             } else {
//                 return next(new AppError("Unauthorized role", 403));
//             }
//         } else {
//             return next(new AppError("User not authenticated", 401));
//         }

//         res.status(200).json({
//             status: "success",
//             results: bookings.length,
//             data: bookings,
//         });
//     } catch (error) {
//         next(error);
//     }
// };

// Get all bookings for a user
const getAllUserBookings = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const features = new APIFeatures(
            Booking.find().where("userId").equals(userId),
            req.query
        )
            .filter()
            .sort()
            .limitFields()
            .paginate();
        const bookings = await features.query;

        res.status(200).json({
            status: "success",
            results: bookings.length,
            data: bookings,
        });
    } catch (error) {
        next(error);
    }
};

// Get all bookings for an operator
const getAllOperatorBookings = async (req, res, next) => {
    try {
        const operatorId = req.user._id;

        const features = new APIFeatures(
            Booking.find().where("operatorId").equals(operatorId),
            req.query
        )
            .filter()
            .sort()
            .limitFields()
            .paginate();
        const bookings = await features.query;

        res.status(200).json({
            status: "success",
            results: bookings.length,
            data: bookings,
        });
    } catch (error) {
        next(error);
    }
};

const getAllBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find();
        res.status(200).json({
            status: "success",
            data: bookings,
        });
    } catch (error) {
        next(error);
    }
};



// Get a single booking by ID
const getBookingById = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return next(new AppError("Booking not found", 404));
        }
        res.status(200).json({
            status: "success",
            data: booking,
        });
    } catch (error) {
        next(error);
    }
};

// Update a booking
const updateBooking = async (req, res, next) => {
    try {
        const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedBooking) {
            return next(new AppError("Booking not found", 404));
        }
        res.status(200).json({
            status: "success",
            data: updatedBooking,
        });
    } catch (error) {
        next(error);
    }
};

// Delete a booking
const deleteBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) {
            return next(new AppError("Booking not found", 404));
        }
        res.status(204).json({
            status: "success",
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

const cancelBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return next(new AppError("Booking not found", 404));
        }
        if (booking.userId.toString() !== req.user._id.toString()) {
            return next(new AppError("You are not authorized to cancel this booking", 403));
        }
        const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
        if (!updatedBooking) {
            return next(new AppError("Booking not found", 404));
        }
        res.status(200).json({
            status: "success",
            data: updatedBooking,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createBooking,
    getAllUserBookings,
    getAllOperatorBookings,
    getBookingById,
    updateBooking,
    deleteBooking,
    cancelBooking,
    getAllUserBookings,
    getAllBookings,
};