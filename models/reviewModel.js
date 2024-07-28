const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    userAvatar: {
        type: String, // URL to user's avatar image
    },
    tourTitle: {
        type: String,
        required: true,
    },
    tourId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour',
        required: true,
    },
    operatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Operator',
        required: true,
    },
    companyName: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    valueForMoneyRating: {
        type: Number,
        min: 1,
        max: 5,
    },
    reviewText: {
        type: String,
        maxlength: 1000,
    },
    isAnonymous: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
