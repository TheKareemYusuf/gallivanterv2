const mongoose = require('mongoose');
const Booking = require("../models/bookingModel");
const Payment = require("../models/paymentModel");
const AppError = require("../utils/appError");
const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const generateBookingCode = require("../utils/bookingCodeGenerator");
const APIFeatures = require("../utils/apiFeatures");
const sendEmail = require("../utils/email");
const axios = require('axios'); 
const CONFIG = require('../config/config');



// Create a new booking
const createBooking = async (req, res, next) => {
    try {


        const { tourIdOrSlug } = req.params;
        const tour = await Tour.findOne({ $or: [{ _id: tourIdOrSlug }, { slug: tourIdOrSlug }] });
        if (!tour) {
            return next(new AppError('Tour not found', 404));
        }

        // Check if booking can be made
        await tour.isBookingAllowed(); 

        // const myId = req.user ? req.user._id : null;


        
        // console.log(myId);

        const {
            userId,
            numberOfParticipants,
            contactDetails,
            activityDetails,
            paymentReference,

        } = req.body;

        if (!paymentReference) {
            return next(new AppError('Payment reference is required', 400));
        }


        const response = await axios.get(`https://api.paystack.co/transaction/verify/${paymentReference}`, {
            headers: {
                Authorization: `Bearer ${CONFIG.PAYSTACK_SECRET_KEY}`,
                'Accept': 'application/json'
            },
        });

        // // check if webhook has been processed
        // const existingPayment = await Payment.findOne({ 'data.reference': paymentReference });

        // if (!existingPayment) {
        //     return next(new AppError('Payment has already been processed', 400));
        // }


        const status = response.status;
        const data = response.data.data;
        const amount = response.data.data.amount / 100;
        //    console.log(amount);



        if (status === 200 && data.status === 'success' && tour.pricing.price === amount) {
            // Generate a booking code
            const bookingCode = generateBookingCode();

            
             // Prepare booking data
            const bookingData = {
                status: 'upcoming',
                userId,
                userType: userId ? 'registered' : 'non-registered',
                paymentReference,
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

            await tour.incrementNumberOfBookings();

            




            // // build user 
            // const user = {
            //     firstName: contactDetails.firstName,
            //     lastName: contactDetails.lastName,
            //     email: contactDetails.email,
            //     phoneNumber: contactDetails.phoneNumber,
            // }
            // // get paymentUrl 
            // // get tour 
            // const regTour = {
            //     tourTitle: tour.tourTitle,
            //     tourPrice: tour.pricing.price,
            // }

            // await new sendEmail(user, tour).bookingConfirmation();

            
        res.status(201).json({
            status: "success",
            message: "Booking created successfully",
            data: newBooking,
        });
        } else {
            return next(new AppError('Payment verification failed', 400));
        }



        
      
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            return next(new AppError(`Payment verification failed: ${error.response.data.message}`, error.response.status));
        } else if (error.request) {
            // The request was made but no response was received
            return next(new AppError('Payment verification failed: No response from payment gateway', 500));
        } else {
            // Something happened in setting up the request that triggered an Error
            return next(new AppError(`Booking failed: ${error.message}`, 500));
        }
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
            message: "Booking updated successfully",
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
            message: "Booking deleted successfully",
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
            message: "Booking cancelled successfully",
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