const mongoose = require('mongoose');
const AppError = require("../utils/appError");

const contactDetailsSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
});

const activityDetailsSchema = new mongoose.Schema({
    firstName: {
        type: String,
        
    },
    lastName: {
        type: String,
        
    },
    dateOfBirth: {
        type: Date,
    },
    specialRequirements: {
        type: String,
    },
});

const BookingSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['upcoming', 'completed', 'cancelled'],
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        default: null
    },
    userFullName: {
        type: String,
        required: true,
    },
    numberOfParticipants: {
        type: Number,
        required: true,
    },
    tourCategory: {
        type: [String],
        required: true,
    },
    tourTitle: {
        type: String,
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
    tourType: {
        type: String,
        enum: ['custom', 'guided'],
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    tourId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour',
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    hasPaid: {
        type: Boolean,
        required: true,
        default: false,
    },
    bookingCode: {
        type: String,
        unique: true,
        required: true,
    },
    paymentReference: {
        type: String,
        required: true,
        unique: true,
    },
    contactDetails: contactDetailsSchema,
    activityDetails: [activityDetailsSchema],
}, { timestamps: true });

// Pre-save hook to check for paymentReference
BookingSchema.pre('save', function (next) {
    if (this.paymentReference) {
        this.hasPaid = true; // Set hasPaid to true if paymentReference exists
    }
    next();
});

const Booking = mongoose.model('Booking', BookingSchema);

module.exports = Booking;
