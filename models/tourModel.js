// const { string } = require("joi");

const mongoose = require('mongoose');
const slugify = require('slugify');
const AppError = require("../utils/appError");
const Booking = require('./bookingModel'); 



const coverageSchema = new mongoose.Schema({
    meals: { type: Boolean },
    accommodation: { type: Boolean },
    transportation: { type: Boolean },
    pickUp: { type: Boolean },
    insurance: { type: Boolean }
});

const locationSchema = new mongoose.Schema({
    country: { type: String },
    address: { type: String }
});

const detailsSchema = new mongoose.Schema({
    included: { type: String }, // Expecting HTML formatted string
    notIncluded: { type: String }, // Expecting HTML formatted string
    highlights: { type: String } // Expecting HTML formatted string
});

const daySchema = new mongoose.Schema({
    dayNumber: { type: Number },
    description: { type: String },
    imageUrl: String,
    imagePublicId: String
});

const itinerarySchema = new mongoose.Schema({
    numberOfDays: { type: Number },
    days: { type: [daySchema] }
});

const requirementsSchema = new mongoose.Schema({
    language: { type: String },
    departurePoint: { type: String },
    transportationMethod: { type: String, enum: ['airplane', 'road', 'rail', 'water'] },
    mealsProvided: {
        breakfast: { type: Boolean },
        lunch: { type: Boolean },
        dinner: { type: Boolean }
    }
});

const pricingSchema = new mongoose.Schema({
    price: {
        type: Number,
    },
    currency: {
        type: String,
        default: "NGN"
    },
    partialPricing: { type: Boolean },
    upfrontPercentage: { type: Number, required: function () { return this.partialPricing; } },
    cancellationPolicy: { type: String, }
});

const gallerySchema = new mongoose.Schema({
    imageUrl: { type: String },
    imagePublicId: { type: String }
});

function arrayLimit(val) {
    return val.length <= 4;
}

const TourSchema = new mongoose.Schema({
    tourType: { type: String, enum: ['custom', 'guided'], required: true },
    tourTitle: { type: String, required: true },
    normalizedTourTitle: { type: String, required: true }, // Add normalized field
    tourDescription: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    arrivalTime: { type: String, required: true },
    departureTime: { type: String, required: true },
    tourCategory: { type: [String], required: true },
    minTraveler: { type: Number, required: true },
    maxTraveler: { type: Number, required: true },
    tourCoverage: { type: coverageSchema, required: true },
    searchKeywords: { type: [String], validate: [arrayLimit, '{PATH} exceeds the limit of 5'] },
    location: { type: locationSchema },
    details: { type: detailsSchema },
    itinerary: { type: itinerarySchema },
    requirements: { type: requirementsSchema },
    pricing: { type: pricingSchema },
    gallery: { type: [gallerySchema] },
    agreedToTerms: { type: Boolean, default: false },
    numberOfBookings: { type: Number, default: 0 },
    operatorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // get the creator from creatorSchema
        ref: "Operator",
    },
    operatorName: {
        type: String,
        // get the creator from creatorSchema
        ref: "Operator",
    },
    companyName: {
        type: String,
        // get the creator from creatorSchema
        ref: "Operator",
    },
    state: {
        type: String,
        default: "draft",
        enum: ["draft", "published"],
    },
    stage: {
        type: String,
        enum: ['upcoming', 'completed'],
        required: true,
        default: "upcoming"
    },
    slug: { type: String, unique: true } // Add the slug field

});

// TourSchema.pre('save', function (next) {
//     const tour = this;
//     if (tour.isModified('tourTitle') || tour.isModified('companyName')) {
//         tour.slug = slugify(`${tour.companyName} ${tour.tourTitle}`, { lower: true, strict: true });
//     }
//     next();
// });

// Pre-save hook to handle slug and ensure uniqueness
TourSchema.pre('save', async function (next) {
    const tour = this;

    if (tour.isModified('tourTitle') || tour.isModified('companyName')) {
        // Convert tourTitle and companyName to lowercase for slug
        const normalizedTitle = tour.tourTitle.toLowerCase().trim();
        const normalizedCompanyName = tour.companyName.toLowerCase().trim();
        tour.normalizedTourTitle = normalizedTitle; // Update normalizedTourTitle
        tour.slug = slugify(`${normalizedCompanyName} ${normalizedTitle}`, { lower: true, strict: true });
    }
    console.log(tour.slug);
    // Ensure unique tourTitle per operatorId
    if (tour.isNew || tour.isModified('tourTitle')) {
        const existingTour = await Tour.findOne({
            normalizedTourTitle: tour.normalizedTourTitle,
            operatorId: tour.operatorId
        });

        if (existingTour && existingTour._id.toString() !== tour._id.toString()) {
            return next(new AppError(`You already have a tour with this title ${tour.tourTitle}`, 400));
        }
    }

    next();
});


TourSchema.methods.updateNumberOfBookings = async function () {
    const tour = this;

    // Find all bookings for this tour and sum the number of participants
    const bookings = await Booking.find({ tourId: tour._id });
    const totalParticipants = bookings.reduce((sum, booking) => sum + booking.numberOfParticipants, 0);

    // Update the numberOfBookings field in the tour model
    tour.numberOfBookings = totalParticipants;

    // Check if the total participants exceed maxTraveler
    if (totalParticipants > tour.maxTraveler) {
        throw new AppError("Booking not allowed: maximum number of travelers exceeded", 400);
    }

    // Save the updated tour document
    await tour.save();
};



TourSchema.index({ tourTitle: 1, operatorId: 1 }, { unique: true });


const Tour = mongoose.model("Tour", TourSchema);

module.exports = Tour;



// const ItinerarySchema = new mongoose.Schema({
//     day: {
//         type: Number,
//         required: true
//     },
//     title: {
//         type: String,
//         required: true
//     },
//     description: {
//         type: String,
//         required: true
//     },
//     image: {
//         type: String,
//         required: true
//     }
// });

// const ImageSchema = new mongoose.Schema({
//     url: String,
//     publicId: String
// });

// const TourSchema = new mongoose.Schema(
//     {
//         title: {
//             type: String,
//             required: [true, "Title is compulsory"],
//             unique: [true, "There's a tour with this name already"],
//             trim: true,
//         },
//         description: {
//             type: String,
//             required: true,
//         },
//         tourType: {
//             type: String,
//             required: true,
//             enum: ["custom-tour", "guided-tour"]
//         },
//         startDate: {
//             type: Date,
//             required: true,
//         },
//         endDate: {
//             type: Date,
//             required: true,
//         },
//         arrivalTime: {

//         },
//         departureTime: {

//         },
//         tourCategory: {
//             type: String,
//             required: true,
//         },
//         minTraveler: {
//             type: Number,
//             required: true,
//             min: 1,
//         },
//         maxTraveler: {
//             type: Number,
//             required: true,
//             min: 1,
//         },
//         tourCoverage: {
//             type: String,
//             enum: ["meals", "accommodation", "transportation", "pick-up", "insurance"]
//         },
//         searchKeywords: {
//             type: [],

//         },
//         operatorId: {
//             type: mongoose.Schema.Types.ObjectId,
//             required: true,
//             // get the creator from creatorSchema
//             ref: "Creator",
//         },
//         operatorName: {
//             type: String,
//             // get the creator from creatorSchema
//             ref: "Creator",
//         },
//         companyName: {
//             type: String,
//             // get the creator from creatorSchema
//             ref: "Creator",
//         },
//         location: {
//             type: String,
//             required: true,
//         },
//         numOfDays: {
//             type: Number,
//             required: true,
//         },
//         price: {
//             type: Number,
//             required: true,
//         },
//         currency: {
//             type: String,
//             required: true,
//         },
//         maxCapacity: {
//             type: Number,
//             required: true,
//         },
//         regMembers: {
//             type: [
//                 {
//                     type: mongoose.Schema.Types.ObjectId,
//                 },
//             ],
//             default: [],
//             validate: {
//                 validator: function (arr) {
//                     return arr.length <= this.maxCapacity; // accessing maxCapacity from the schema
//                 },
//                 message: "Number of registered members cannot exceed the maximum capacity"
//             },

//         },
//         wishList: {
//             type: [
//                 {
//                     type: mongoose.Schema.Types.ObjectId,
//                 },
//             ],
//             default: [],

//         },
//         numOfWishList: {
//             type: Number,
//             default: 0,
//         },
//         numOfRegMembers: {
//             type: Number,
//             default: 0,
//         },
//         tags: [String],
//         itinerary: [ItinerarySchema],
//         tourCoverImageUrl: String,
//         tourCoverImagePublicId: String,
//         tourImagesData: [ImageSchema],
//         state: {
//             type: String,
//             default: "draft",
//             enum: ["draft", "published"],
//         },

//     },
//     { timestamps: true }
// );
