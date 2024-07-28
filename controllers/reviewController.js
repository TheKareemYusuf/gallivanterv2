const mongoose = require("mongoose");
const Review = require("../models/reviewModel");
const AppError = require("../utils/appError");
const Tour = require("./../models/tourModel")
const User = require("./../models/userModel")
const APIFeatures = require("./../utils/apiFeatures")


// Create a new review
const createReview = async (req, res, next) => {
    try {

        const { tourIdOrSlug } = req.params;
        const userId = req.user._id;
       

        // Check if tourIdOrSlug is a valid ObjectId
        const isObjectId = mongoose.Types.ObjectId.isValid(tourIdOrSlug);



        // Find the tour by either ID or slug
        const tour = await Tour.findOne(isObjectId ? { _id: tourIdOrSlug } : { slug: tourIdOrSlug });
        if (!tour) {
            return next(new AppError("Tour not found", 404));
        }

        const user = await User.findById(userId);

        const { rating, valueForMoneyRating, reviewText, isAnonymous } = req.body;

        const newReview = await Review.create({
            userId,
            firstName: user.firstName,
            userAvatar: user.userImageUrl,
            tourTitle: tour.tourTitle,
            tourId: tour._id,
            operatorId: tour.operatorId,
            companyName: tour.companyName,
            rating,
            valueForMoneyRating,
            reviewText,
            isAnonymous,
        });

        res.status(201).json({
            status: "success",
            message: "Review created successfully",
            data: newReview,
        });
    } catch (error) {
        next(error);
    }
};

// Get all reviews for a specific tour
const getAllReviewsByTour = async (req, res, next) => {
    try {

        const { tourIdOrSlug } = req.params;

        const isObjectId = mongoose.Types.ObjectId.isValid(tourIdOrSlug);

        const tour = await Tour.findOne(isObjectId ? { _id: tourIdOrSlug } : { slug: tourIdOrSlug });


        const features = new APIFeatures(Review.find({ tourId: tour._id }), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        const reviews = await features.query;

        res.status(200).json({
            status: "success",
            results: reviews.length,
            data: reviews,
        });
    } catch (error) {
        next(error);
    }
};

const getAllReviewsByUser = async (req, res, next) => {
    try {

        const userId = req.user._id;

        const features = new APIFeatures(Review.find({ userId: userId }), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        const reviews = await features.query;

        res.status(200).json({
            status: "success",
            results: reviews.length,
            data: reviews,
        });
    } catch (error) {
        next(error);
    }
};

const getAllReviewsByOperator = async (req, res, next) => {
    try {

        const operatorId = req.user._id;

        const features = new APIFeatures(Review.find({ operatorId }), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        const reviews = await features.query;

        res.status(200).json({
            status: "success",
            results: reviews.length,
            data: reviews,
        });
    } catch (error) {
        next(error);
    }
};

const getAllReviewsByCompany = async (req, res, next) => {
    try {

        const { companyName } = req.params;

        const features = new APIFeatures(Review.find({ companyName }), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        const reviews = await features.query;

        res.status(200).json({
            status: "success",
            results: reviews.length,
            data: reviews,
        });
    } catch (error) {
        next(error);
    }
};

const getOneReview = async (req, res, next) => {
    try {
        const reviewId = req.params._id

        const review = await Review.findOne({reviewId})

        res.status(200).json({
            status: "success",
            data: review,
        });
    } catch (error) {
        next(error)
    }
}

// Update a review
const updateReview = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        let reviewUpdate = { ...req.body };


        const oldReview = await Review.findById(reviewId);

        if (!oldReview) {
            return next(new AppError("Review not found", 404));
        }

        const updatedReview = await Review.findByIdAndUpdate(reviewId, reviewUpdate, {
            new: true,
            runValidators: true,
        });

        if (!updatedReview) {
            return next(new AppError("Review not found", 404));
        }

        res.status(200).json({
            status: "success",
            message: "Review updated successfully",
            data: updatedReview,
        });
    } catch (error) {
        next(error);
    }
};

// Delete a review
const deleteReview = async (req, res, next) => {
    try {
        const { reviewId } = req.params;

        const deletedReview = await Review.findByIdAndDelete(reviewId);

        if (!deletedReview) {
            return next(new AppError("Review not found", 404));
        }

        res.status(204).json({
            status: "success",
            message: "Review deleted successfully",
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createReview,
    getAllReviewsByCompany,
    getAllReviewsByTour,
    getAllReviewsByUser,
    getAllReviewsByOperator,
    getOneReview,
    updateReview,
    deleteReview,
};